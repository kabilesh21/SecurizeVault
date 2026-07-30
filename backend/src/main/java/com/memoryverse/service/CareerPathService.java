package com.memoryverse.service;

import com.memoryverse.dto.CareerPathResponse;
import com.memoryverse.entity.CareerPath;
import com.memoryverse.entity.UserCareerPath;
import com.memoryverse.repository.CareerPathRepository;
import com.memoryverse.repository.UserCareerPathRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CareerPathService {

    @Autowired
    private CareerPathRepository careerPathRepository;

    @Autowired
    private UserCareerPathRepository userCareerPathRepository;

    @PostConstruct
    @Transactional
    public void seedCareerPaths() {
        if (careerPathRepository.count() == 0) {
            seed("AI/ML Engineer", 
                 "Builds, trains, and deploys machine learning and deep learning models to solve complex business problems.", 
                 "Artificial Intelligence", 
                 "Python,TensorFlow,PyTorch,Machine Learning,Deep Learning,SQL,Go,Data Analysis");

            seed("Full Stack Developer", 
                 "Designs and implements both client-side and server-side logic, managing data persistence, RESTful APIs, and frontend layouts.", 
                 "Software Engineering", 
                 "React,JavaScript,Java,Spring Boot,MySQL,HTML,CSS,TypeScript,Git");

            seed("Data Analyst", 
                 "Analyzes datasets to identify trends, create visualizations, and generate actionable business insights.", 
                 "Data Science", 
                 "Python,SQL,MySQL,Data Analysis,Excel,Tableau");

            seed("Backend Developer", 
                 "Develops robust server-side APIs, manages databases, and ensures system scalability and security.", 
                 "Software Engineering", 
                 "Java,Spring Boot,MySQL,Docker,Kubernetes,AWS,REST API,Git");

            seed("Frontend Developer", 
                 "Creates responsive, interactive, and visually stunning web user interfaces using modern libraries and frameworks.", 
                 "Software Engineering", 
                 "React,TypeScript,JavaScript,HTML,CSS,Tailwind,Bootstrap,Next.js,Git");
        }
    }

    private void seed(String name, String desc, String industry, String skills) {
        CareerPath path = CareerPath.builder()
                .name(name)
                .description(desc)
                .industry(industry)
                .requiredSkills(skills)
                .build();
        careerPathRepository.save(path);
    }

    public List<CareerPathResponse> getRecommendedCareerPaths(Long userId) {
        List<UserCareerPath> userPaths = userCareerPathRepository.findByUserId(userId);
        return userPaths.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CareerPath> getAllCareerPaths() {
        return careerPathRepository.findAll();
    }

    private CareerPathResponse mapToResponse(UserCareerPath ucp) {
        return CareerPathResponse.builder()
                .id(ucp.getCareerPath().getId())
                .name(ucp.getCareerPath().getName())
                .description(ucp.getCareerPath().getDescription())
                .industry(ucp.getCareerPath().getIndustry())
                .requiredSkills(ucp.getCareerPath().getRequiredSkills())
                .confidenceScore(ucp.getConfidenceScore())
                .reason(ucp.getReason())
                .status(ucp.getStatus())
                .build();
    }
}
