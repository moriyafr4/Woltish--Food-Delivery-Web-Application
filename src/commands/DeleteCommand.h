#ifndef DELETECOMMAND_H
#define DELETECOMMAND_H

#include "ICommand.h"
#include "infrastructure/IDataRepository.h"
#include <vector>
#include <string>

/**
 * DeleteCommand class
 * Responsible for handling the "DELETE" protocol command.
 */
class DeleteCommand : public ICommand {
private:
    IDataRepository* repository_; // Pointer to the data storage 

public:
    /**
     * Constructor
     * @param repository A pointer to the repository to perform deletions on.
     */
    DeleteCommand(IDataRepository* repository);

    /**
     * Executes the delete logic.
     * Expected args: {"DELETE", "userid", "productid1", "productid2", ...}.
     * @param args A vector of command arguments.
     * @return A status string for the client (e.g., "204 No Content" or "404 Not Found").
     */
    std::string execute(const std::vector<std::string>& args) override;
    
};

#endif // DELETECOMMAND_H