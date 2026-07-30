import re

class EntityNormalizer:
    # Mappings from raw strings to normalized forms
    NORM_MAP = {
        r'\bpython(\s*\d+)?(\s*programming)?\b': 'Python',
        r'\bjava(\s*\d+)?(\s*se|ee|programming)?\b': 'Java',
        r'\bspring\s*boot\b': 'Spring Boot',
        r'\bspring\s*framework\b': 'Spring Boot',
        r'\breact(\s*js)?\b': 'React',
        r'\bnode(\s*js)?\b': 'Node.js',
        r'\btypescript\b': 'TypeScript',
        r'\bjavascript\b': 'JavaScript',
        r'\bmysql\b': 'MySQL',
        r'\bpostgresql\b': 'PostgreSQL',
        r'\bmongodb\b': 'MongoDB',
        r'\bdocker\b': 'Docker',
        r'\bkubernetes\b': 'Kubernetes',
        r'\baws\b': 'AWS',
        r'\bamazon\s*web\s*services\b': 'AWS',
        r'\bgit(\s*hub)?\b': 'Git',
        r'\btensorflow\b': 'TensorFlow',
        r'\bpy\s*torch\b': 'PyTorch',
        r'\bmachine\s*learning\b': 'Machine Learning',
        r'\bdeep\s*learning\b': 'Deep Learning',
        r'\bdata\s*analytics?\b': 'Data Analysis',
        r'\bdata\s*analysis?\b': 'Data Analysis',
        r'\bhtml(\s*5)?\b': 'HTML',
        r'\bcss(\s*3)?\b': 'CSS'
    }

    @classmethod
    def normalize_skill(cls, skill_name: str) -> str:
        s = skill_name.strip().lower()
        for pattern, normalized in cls.NORM_MAP.items():
            if re.search(pattern, s):
                return normalized
        # Default fallback: title case
        return skill_name.strip().title()

    @classmethod
    def normalize_org(cls, org_name: str) -> str:
        # Standardize company names like Google Inc. or Microsoft Corp.
        s = org_name.strip()
        s = re.sub(r'\b(inc|corp|ltd|llc|gmbh|co)\b\.?', '', s, flags=re.IGNORECASE)
        return s.strip()
