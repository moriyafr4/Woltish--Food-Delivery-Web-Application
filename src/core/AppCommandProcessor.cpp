#include "AppCommandProcessor.h"
#include "commands/AddCommand.h"
#include "commands/RecommendCommand.h"
#include "commands/HelpCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"
#include <sstream>
#include <iterator>
#include <algorithm>
#include <memory>
#include <vector>
#include <cctype>

AppCommandProcessor::AppCommandProcessor(IDataRepository* repository) : repository_(repository) {
    // write in the map the name of the commands
    commands_["post"] = std::make_unique<AddCommand>(repository_);       
    commands_["get"] = std::make_unique<RecommendCommand>(repository_);  
    commands_["help"] = std::make_unique<HelpCommand>();  
    commands_["patch"] = std::make_unique<PatchCommand>(repository_);               
    commands_["delete"] = std::make_unique<DeleteCommand>(repository_);    
}

std::string AppCommandProcessor::processCommand(const std::string& commandLine) {
    // Make the string for first command, second command... by margin
    std::istringstream iss(commandLine);
    std::vector<std::string> args{std::istream_iterator<std::string>{iss},
                                 std::istream_iterator<std::string>{}};

    // if the string is empty
    if (args.empty()) {
        return "400 Bad Request"; 
    }

    // Extract the name of the command (first argumnt)
    std::string cmdName = args[0];

    std::transform(cmdName.begin(), cmdName.end(), cmdName.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    
    // Search the command in the map
    auto it = commands_.find(cmdName);
    if (it != commands_.end()) {
        // we will execute the command and return the result
        return it->second->execute(args);
    }

    // If the command not in the map
    return "400 Bad Request"; 
}