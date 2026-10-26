#ifndef ADD_COMMAND_H
#define ADD_COMMAND_H

#include "infrastructure/IDataRepository.h"
#include "ICommand.h"
#include <string>

/**
 * AddCommand Class
 * Responsible for parsing the 'add' command and updating the user's product list.
 */
class AddCommand : public ICommand {
public:
    /**
     * Constructor for AddCommand.
     */
    explicit AddCommand(IDataRepository* repository);

    // Changed for Ex2, execute the add command, get a vector and return string
    std::string execute(const std::vector<std::string>& args) override;

private:
    IDataRepository* repository_;
};

#endif