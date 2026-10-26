#include "recommender.h"
#include <algorithm>
#include <stdexcept>

// Calculate the intersection between 2 users.
int Recommender::calculateSimilarity(const std::set<std::string>& userAViews, const std::set<std::string>& userBViews) {
    int weight = 0;
    for (const auto& prod : userAViews) {
        if (userBViews.count(prod)) {
            weight++;
        }
    }
    return weight;
}

std::vector<std::string> Recommender::calculateRecommendations(
    const std::map<std::string, std::set<std::string>>& allUserViews,
    const std::string& targetUserId, 
    const std::string& targetProductId) {
    
    // Map of intersection between ant ID to a targetUserId
    std::map<std::string, int> productScores;
    // lst of the recommend, In order.
    std::vector<std::string> recommendations;

    // Make sure that targetUserId is in the lis
    auto it = allUserViews.find(targetUserId);
    if (it == allUserViews.end()) {
        return recommendations; // return empty list
    }

    // Take the set of our user and set a tergeted variable for him. 
    const auto& targetUserViews = it->second;

    // Search for users with similar preference.
    for (const auto& pair : allUserViews) {
        const std::string& currentUserId = pair.first;
        const auto& currentViews = pair.second;
        
        if (currentUserId == targetUserId) continue; // We do not compare it to itself.
        
        // If the current ID has the targetedes product ID we claculate similarity. 
        if (currentViews.count(targetProductId)) {
            int weight = calculateSimilarity(targetUserViews, currentViews);
            
            // 3.  If there is intersection, we add it to the total score.
            if (weight > 0) {
                for (const auto& prod : currentViews) {
                    // Make sure that evryone we add is not the product itself, or one in his watch list.
                    if (prod != targetProductId && targetUserViews.count(prod) == 0) {
                        productScores[prod] += weight;
                    }
                }
            }
        }
    }
    
    // Vector for sorting
    std::vector<std::pair<std::string, int>> sortedProducts(productScores.begin(), productScores.end());
    
    // Score by score is descending, and in case of equality by product ID is ascending.
    std::sort(sortedProducts.begin(), sortedProducts.end(), [](const auto& a, const auto& b) {
        // If the products have different score
        if (a.second != b.second) {
            return a.second > b.second; 
        }
        // If they have the same score, sort them by ascending order
        try {
            return std::stoi(a.first) < std::stoi(b.first);
        } catch (...) {
            return a.first < b.first; 
        }
    });

    // Extracting up to 10 top products and entering them into the answer vector.
    for (size_t i = 0; i < sortedProducts.size() && i < 10; ++i) {
        recommendations.push_back(sortedProducts[i].first);
    }

    return recommendations;
}