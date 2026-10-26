#include "RecommendCommand.h"
#include "core/recommender.h"
#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <map>
#include <set>
#include <algorithm>

/**
 * RecommendCommand Implementation
 * Connects the CLI input to the recommendation algorithm.
 */

// Check if a string is a digit 
 static bool isNumeric(const std::string& str) {
    return !str.empty() && std::all_of(str.begin(), str.end(), ::isdigit);
}
RecommendCommand::RecommendCommand(IDataRepository* repository) : repository_(repository) {}

std::string RecommendCommand::execute(const std::vector<std::string>& args)  {
    // Check if the pattern is right (GET, userid, productid)
    if (args.size() != 3) {
        return "400 Bad Request";
    }

    // Check the userid and the productid are digits
    if (!isNumeric(args[1]) || !isNumeric(args[2])) {
        return "400 Bad Request";
    }

    // Define the userid and the productid
    std::string userId = args[1];
    std::string targetProductId = args[2];

    // Is the user in the repository?
    if (!repository_->userExists(userId)) {
        return "404 Not Found"; 
    }

    // get the database
    auto unorderedData = repository_->getAllUsersData();

    // Sort the data 
    std::map<std::string, std::set<std::string>> allUsersData;
    for (const auto& pair : unorderedData) {
        allUsersData[pair.first] = std::set<std::string>(pair.second.begin(), pair.second.end());
    }

    // Get the recommedations
    std::vector<std::string> recommendations = Recommender::calculateRecommendations(
        allUsersData, 
        userId, 
        targetProductId
    );

    // Return Ok if we arrived here
    std::string response = "200 Ok\n\n";

    // Add the recommendation to the response from the function
    for (size_t i = 0; i < recommendations.size(); ++i) {
        response += recommendations[i];
        if (i != recommendations.size() - 1) {
            response += " "; // Add margin between the recommendations
        }
    }

    return response;
}