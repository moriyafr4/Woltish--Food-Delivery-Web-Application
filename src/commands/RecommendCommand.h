#ifndef RECOMMEND_COMMAND_H
#define RECOMMEND_COMMAND_H

#include "infrastructure/IDataRepository.h"
#include "core/recommender.h"
#include "ICommand.h"
#include <string>
#include <vector>

/**
 * RecommendCommand Class
 * Responsible for handling the 'recommend' command logic by connecting 
 * the data repository with the recommendation algorithm.
 */
class RecommendCommand : public ICommand {
public:
    /**
     * Constructor for RecommendCommand.
     */
    explicit RecommendCommand(IDataRepository* repository);

    /**
     * Executes the recommendation logic based on user input.
     * * Input: A full command line string.
     * * Output: None (Directly prints the top 10 recommended product IDs to stdout).
     */
    std::string execute(const std::vector<std::string>& args) override;

private:
    IDataRepository* repository_;

    /**
     * Formats and prints the results list to the standard output.
     * * Input: A vector of recommended product IDs.
     * * Output: None.
     */
    void printRecommendations(const std::vector<std::string>& recommendations) const;
};

#endif