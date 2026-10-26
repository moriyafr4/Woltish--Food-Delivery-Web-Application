#include "DeleteCommand.h"
#include <algorithm>
#include <cctype>

// Utility to check if string is a positive integer
inline bool isNumeric(const std::string& str) {
    return !str.empty() && std::all_of(str.begin(), str.end(), ::isdigit);
}

DeleteCommand::DeleteCommand(IDataRepository* repository) : repository_(repository) {}

std::string DeleteCommand::execute(const std::vector<std::string>& args) {
    //  Syntax Check: Must have at least DELETE, userid, and one productid 
    if (args.size() < 3) {
        return "400 Bad Request"; 
    }

    //  Validate UserID syntax
    if (!isNumeric(args[1])) {
        return "400 Bad Request"; 
    }
    std::string userId = args[1];

    //  Logical Check: Does the user exist? 
    if (!repository_->userExists(userId)) {
        return "404 Not Found";  
    }

    // Validate Products syntax and gather them
    std::vector<std::string> productIds;
    for (size_t i = 2; i < args.size(); ++i) {
        if (!isNumeric(args[i])) {
            return "400 Bad Request";
        }
        // Check if the user watched the product in the past
        if (!repository_->hasProduct(userId, args[i])) {
            return "404 Not Found"; 
        }
        productIds.push_back(args[i]);
    }

    // Execution: Remove products via repository 
    repository_->removeProducts(userId, productIds);

    //  Success Output 
    return "204 No Content";
}

