#ifndef IMENU_H
#define IMENU_H

#include <string>

/**
 * Interface for User Interaction.
 */

class IMenu {
public:
    virtual ~IMenu() = default;

    // Reads the next line from the user.
    virtual std::string nextCommand() = 0;
};

#endif