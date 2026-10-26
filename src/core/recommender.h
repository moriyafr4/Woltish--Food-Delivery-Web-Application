#ifndef RECOMMENDER_H
#define RECOMMENDER_H

#include <string>
#include <vector>
#include <map>
#include <set>

class Recommender {
public:
    //The only function that is exposed externally.
    // It receives all the information from an external source ,
    // calculates, and returns a vector of up to 10 recommended product IDs
    static std::vector<std::string> calculateRecommendations(
        const std::map<std::string, std::set<std::string>>& allUserViews,
        const std::string& targetUserId, 
        const std::string& targetProductId
    );

private:
    // Private function to calculate the mathematical weight between two groups of products.
    static int calculateSimilarity(
        const std::set<std::string>& userAViews, 
        const std::set<std::string>& userBViews
    );
};

#endif // RECOMMENDER_H