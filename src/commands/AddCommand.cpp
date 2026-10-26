#include "AddCommand.h"
#include <sstream>
#include <vector>
#include <string>
#include <algorithm>
#include <cctype>

inline bool isNumeric(const std::string& str) {
    // Check the string not empty and all are digits
    return !str.empty() && std::all_of(str.begin(), str.end(), ::isdigit);
}

// Constructor implementation
AddCommand::AddCommand(IDataRepository* repository) : repository_(repository) {}

//Implementation of execute
std::string AddCommand::execute(const std::vector<std::string>& args)  {
    // Check for at least 2 args, arg[0] is "POST", arg[1] is userid
    if (args.size() < 2) {
        return "400 Bad Request"; 
    }
    // Validate userid is digit
    if (!isNumeric(args[1])) {
        return "400 Bad Request"; 
    }
    std::string userId = args[1];

    // Check if the user name is not in the data
    if (repository_->userExists(userId)) {
        return "404 Not Found"; 
    }

    std::vector<std::string> productIds;
    // add the products to the data
    for (size_t i = 2; i < args.size(); ++i) {
        // Validate all products are digits
        if (!isNumeric(args[i])) {
            return "400 Bad Request"; 
        }
        productIds.push_back(args[i]);
    }
    // If there are no products
    if (productIds.empty()) {
        return "400 Bad Request";
    }
    // if it is all ok add it to the data
    repository_->addProducts(userId, productIds);
    return "201 Created";

}

