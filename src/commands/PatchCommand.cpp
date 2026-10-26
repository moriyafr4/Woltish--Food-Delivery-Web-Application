#include "PatchCommand.h"
#include <algorithm>
#include <cctype>

// Helper for find if something is not digit
inline bool isNumeric(const std::string& str) {
    return !str.empty() && std::all_of(str.begin(), str.end(), ::isdigit);
}

PatchCommand::PatchCommand(IDataRepository* repository) : repository_(repository) {}

std::string PatchCommand::execute(const std::vector<std::string>& args) {
    //  Check for minimal args (PATCH + userid) 
    if (args.size() < 2) {
        return "400 Bad Request";
    }

    // 2. Check userid is ok
    if (!isNumeric(args[1])) {
        return "400 Bad Request";
    }
    std::string userId = args[1];

    // Check if the number is in the data
    if (!repository_->userExists(userId)) {
        return "404 Not Found"; 
    }

    // validate the productids are digits
    std::vector<std::string> productIds;
    for (size_t i = 2; i < args.size(); ++i) {
        if (!isNumeric(args[i])) {
            return "400 Bad Request";
        }
        productIds.push_back(args[i]);
    }

    // check that the product vector is not empty
    if (productIds.empty()) {
        return "400 Bad Request";
    }

    // Update
    repository_->addProducts(userId, productIds);

    // if all happened
    return "204 No Content"; 
}