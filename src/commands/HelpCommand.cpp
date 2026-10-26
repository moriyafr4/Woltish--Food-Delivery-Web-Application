#include "HelpCommand.h"
#include <iostream>
#include <sstream>

// Implementation of getHelpText
std::string HelpCommand::getHelpText() const {
    return "add [userid] [productid1] [productid2]...\n"
            "recommend [userid] [productid]\n"
            "help\n";
}

// Implementation of execute
std::string HelpCommand::execute(const std::vector<std::string>& args) {
    if (args.size() > 1) {
        return "400 Bad Request";
    }
    std::string helpText = 
    "DELETE, arguments: [userid] [productid1] [productid2]...\n"
    "GET, arguments: [userid] [productid]\n"
    "PATCH, arguments: [userid] [productid1] [productid2]...\n"
    "POST, arguments: [userid] [productid1] [productid2]...\n"
    "help";

    // Return the help text to server
    return helpText;
}