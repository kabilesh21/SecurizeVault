from typing import List, Dict, Any
from .models import DocumentInput, SkillInput, EntityInput, NodeResponse, RelationshipResponse
from .entity_normalizer import EntityNormalizer
from .semantic_matcher import SemanticMatcher

class RelationshipRules:
    @staticmethod
    def extract_relationships(
        documents: List[DocumentInput],
        skills: List[SkillInput],
        entities: List[EntityInput]
    ) -> tuple:
        nodes = []
        relationships = []
        node_map = {} # Maps temporaryId -> NodeResponse

        # Helper to register a node
        def add_node(temp_id: str, n_type: str, name: str, ref_id: int = None, desc: str = None, source_doc_id: int = None, metadata: dict = None):
            if temp_id not in node_map:
                node = NodeResponse(
                    temporaryId=temp_id,
                    type=n_type,
                    referenceId=ref_id,
                    name=name,
                    description=desc or f"{n_type.replace('_', ' ').title()} node for {name}",
                    metadata=metadata or {},
                    sourceDocumentId=source_doc_id
                )
                node_map[temp_id] = node
                nodes.append(node)
            return temp_id

        # 1. Create Document-based Nodes
        doc_by_id = {d.id: d for d in documents}
        
        for d in documents:
            doc_node_id = f"doc-{d.id}"
            add_node(doc_node_id, "DOCUMENT", d.title, ref_id=d.id, desc=f"Ingested document: {d.originalName}")
            
            # Map specific category nodes if applicable
            if d.category == 'CERTIFICATE':
                cert_node_id = f"cert-{d.id}"
                add_node(cert_node_id, "CERTIFICATE", d.title, ref_id=d.id, desc=f"Certificate: {d.title}", source_doc_id=d.id)
                # Link Document to Certificate
                relationships.append(RelationshipResponse(
                    source=doc_node_id,
                    target=cert_node_id,
                    type="RELATED_TO",
                    confidence=1.0,
                    evidence="Document classified as a certificate.",
                    generationMethod="RULE_BASED"
                ))
            elif d.category == 'PROJECT_REPORT':
                proj_node_id = f"proj-{d.id}"
                add_node(proj_node_id, "PROJECT", d.title, ref_id=d.id, desc=f"Project: {d.title}", source_doc_id=d.id)
                # Link Document to Project
                relationships.append(RelationshipResponse(
                    source=doc_node_id,
                    target=proj_node_id,
                    type="RELATED_TO",
                    confidence=1.0,
                    evidence="Document classified as a project report.",
                    generationMethod="RULE_BASED"
                ))
            elif d.category == 'INTERNSHIP_LETTER':
                int_node_id = f"intern-{d.id}"
                add_node(int_node_id, "INTERNSHIP", d.title, ref_id=d.id, desc=f"Internship letter for {d.title}", source_doc_id=d.id)
                # Link Document to Internship
                relationships.append(RelationshipResponse(
                    source=doc_node_id,
                    target=int_node_id,
                    type="RELATED_TO",
                    confidence=1.0,
                    evidence="Document classified as an internship letter.",
                    generationMethod="RULE_BASED"
                ))
            elif d.category == 'RESUME':
                res_node_id = f"resume-{d.id}"
                add_node(res_node_id, "RESUME", d.title, ref_id=d.id, desc=f"Resume: {d.title}", source_doc_id=d.id)
                # Link Document to Resume
                relationships.append(RelationshipResponse(
                    source=doc_node_id,
                    target=res_node_id,
                    type="RELATED_TO",
                    confidence=1.0,
                    evidence="Document classified as a resume.",
                    generationMethod="RULE_BASED"
                ))

        # 2. Create Skill and Technology Nodes
        for s in skills:
            norm_name = EntityNormalizer.normalize_skill(s.name)
            skill_node_id = f"skill-{norm_name.lower().replace(' ', '-')}"
            add_node(skill_node_id, "SKILL", norm_name)
            
            # Link document to skill if it has a documentId
            if s.documentId:
                doc_node_id = f"doc-{s.documentId}"
                if doc_node_id in node_map:
                    relationships.append(RelationshipResponse(
                        source=doc_node_id,
                        target=skill_node_id,
                        type="MENTIONS",
                        confidence=s.confidence,
                        evidence=f"Skill '{norm_name}' extracted from text.",
                        generationMethod="AI_INFERRED"
                    ))

        # 3. Create Entity Nodes (Organizations, Technologies, Achievements)
        for e in entities:
            if e.type == 'ORGANIZATION':
                norm_org = EntityNormalizer.normalize_org(e.value)
                org_node_id = f"org-{norm_org.lower().replace(' ', '-')}"
                add_node(org_node_id, "ORGANIZATION", norm_org)
                
                # Link document to organization
                if e.documentId:
                    doc_node_id = f"doc-{e.documentId}"
                    if doc_node_id in node_map:
                        relationships.append(RelationshipResponse(
                            source=doc_node_id,
                            target=org_node_id,
                            type="MENTIONS",
                            confidence=e.confidence,
                            evidence=f"Organization '{norm_org}' mentioned in document.",
                            generationMethod="RULE_BASED"
                        ))
            elif e.type == 'TECHNOLOGY':
                tech_name = e.value.strip().title()
                tech_node_id = f"tech-{tech_name.lower().replace(' ', '-')}"
                add_node(tech_node_id, "TECHNOLOGY", tech_name)
                
                # Link document to technology
                if e.documentId:
                    doc_node_id = f"doc-{e.documentId}"
                    if doc_node_id in node_map:
                        relationships.append(RelationshipResponse(
                            source=doc_node_id,
                            target=tech_node_id,
                            type="USES",
                            confidence=e.confidence,
                            evidence=f"Technology '{tech_name}' used in document.",
                            generationMethod="RULE_BASED"
                        ))

        # 4. Generate Rule-Based and Semantic Relationships
        # Rule 1: Certificate -> Skill (CERTIFIES)
        for cert_node in [n for n in nodes if n.type == 'CERTIFICATE']:
            cert_doc = doc_by_id.get(cert_node.referenceId)
            if not cert_doc:
                continue
            
            # Find matching skills in the certificate's title or ocr text
            for skill_node in [n for n in nodes if n.type == 'SKILL']:
                skill_name = skill_node.name
                
                # Semantic check or string contains check
                sim = SemanticMatcher.similarity(cert_doc.title, skill_name)
                contains_check = skill_name.lower() in cert_doc.title.lower() or (cert_doc.ocrText and skill_name.lower() in cert_doc.ocrText.lower())
                
                if contains_check or sim > 0.6:
                    confidence = 0.95 if contains_check else sim
                    relationships.append(RelationshipResponse(
                        source=cert_node.temporaryId,
                        target=skill_node.temporaryId,
                        type="CERTIFIES",
                        confidence=confidence,
                        evidence=f"Certificate '{cert_doc.title}' certifies competence in '{skill_name}'.",
                        generationMethod="RULE_BASED"
                    ))

        # Rule 2: Skill -> Project (CONTRIBUTES_TO & DEMONSTRATES)
        for proj_node in [n for n in nodes if n.type == 'PROJECT']:
            proj_doc = doc_by_id.get(proj_node.referenceId)
            if not proj_doc:
                continue
                
            for skill_node in [n for n in nodes if n.type == 'SKILL']:
                skill_name = skill_node.name
                
                # Check if project contains skill in description/title/ocr
                contains = skill_name.lower() in proj_doc.title.lower() or (proj_doc.ocrText and skill_name.lower() in proj_doc.ocrText.lower())
                sim = SemanticMatcher.similarity(proj_doc.title, skill_name)
                
                if contains or sim > 0.5:
                    confidence = 0.92 if contains else sim
                    # Skill contributes to Project
                    relationships.append(RelationshipResponse(
                        source=skill_node.temporaryId,
                        target=proj_node.temporaryId,
                        type="CONTRIBUTES_TO",
                        confidence=confidence,
                        evidence=f"Skill '{skill_name}' is utilized in project '{proj_doc.title}'.",
                        generationMethod="RULE_BASED"
                    ))
                    # Project demonstrates Skill
                    relationships.append(RelationshipResponse(
                        source=proj_node.temporaryId,
                        target=skill_node.temporaryId,
                        type="DEMONSTRATES",
                        confidence=confidence,
                        evidence=f"Project '{proj_doc.title}' demonstrates competence in '{skill_name}'.",
                        generationMethod="RULE_BASED"
                    ))

        # Rule 3: Project -> Internship (BUILT_DURING)
        for proj_node in [n for n in nodes if n.type == 'PROJECT']:
            proj_doc = doc_by_id.get(proj_node.referenceId)
            if not proj_doc:
                continue
                
            for intern_node in [n for n in nodes if n.type == 'INTERNSHIP']:
                intern_doc = doc_by_id.get(intern_node.referenceId)
                if not intern_doc:
                    continue
                
                # Check if project name is mentioned in internship text or if they share skills
                proj_mentioned = proj_doc.title.lower() in intern_doc.title.lower() or (intern_doc.ocrText and proj_doc.title.lower() in intern_doc.ocrText.lower())
                
                # Calculate shared skills overlap
                proj_skills = {s.name.lower() for s in skills if s.documentId == proj_doc.id}
                intern_skills = {s.name.lower() for s in skills if s.documentId == intern_doc.id}
                shared_skills = proj_skills.intersection(intern_skills)
                
                # Direct regex / name overlaps
                org_match = False
                proj_orgs = {e.value.lower() for e in entities if e.documentId == proj_doc.id and e.type == 'ORGANIZATION'}
                intern_orgs = {e.value.lower() for e in entities if e.documentId == intern_doc.id and e.type == 'ORGANIZATION'}
                if proj_orgs.intersection(intern_orgs):
                    org_match = True
                
                if proj_mentioned or len(shared_skills) >= 2 or org_match:
                    confidence = 0.95 if proj_mentioned else (0.85 if org_match else 0.78)
                    relationships.append(RelationshipResponse(
                        source=proj_node.temporaryId,
                        target=intern_node.temporaryId,
                        type="BUILT_DURING",
                        confidence=confidence,
                        evidence=f"Project '{proj_doc.title}' was developed during the '{intern_doc.title}' internship.",
                        generationMethod="SEMANTIC_MATCH"
                    ))

        # Rule 7: Resume -> Experience (MENTIONS)
        for res_node in [n for n in nodes if n.type == 'RESUME']:
            res_doc = doc_by_id.get(res_node.referenceId)
            if not res_doc:
                continue
                
            for exp_node in [n for n in nodes if n.temporaryId != res_node.temporaryId and n.type in ['SKILL', 'PROJECT', 'CERTIFICATE', 'INTERNSHIP']]:
                # Check if name is mentioned in resume text
                is_mentioned = exp_node.name.lower() in res_doc.title.lower() or (res_doc.ocrText and exp_node.name.lower() in res_doc.ocrText.lower())
                
                if is_mentioned:
                    relationships.append(RelationshipResponse(
                        source=res_node.temporaryId,
                        target=exp_node.temporaryId,
                        type="MENTIONS",
                        confidence=0.98,
                        evidence=f"Resume mentions '{exp_node.name}'.",
                        generationMethod="RULE_BASED"
                    ))

        return nodes, relationships
