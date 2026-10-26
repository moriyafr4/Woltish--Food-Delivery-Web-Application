#ifndef FILEDATAREPOSITORY_H
#define FILEDATAREPOSITORY_H

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include "IDataRepository.h"
#include <string>

class FileDataRepository : public IDataRepository {
public:
    // Gets path to data file
    explicit FileDataRepository(const std::string& filePath = "data/users_data.txt");
    std::unordered_map<std::string, std::unordered_set<std::string>>
        getAllUsersData() const override;
    void addProducts(const std::string& userId,
        const std::vector<std::string>& productIds) override;
    bool userExists(const std::string& userId) const override;
    // get the user id and the products and delete them from the data
     void removeProducts(const std::string& userId, const std::vector<std::string>& productIds) override;
    // find if the user has the product
     bool hasProduct(const std::string& userId, const std::string& productId) const override;

private:
    std::string filePath;
    std::unordered_map<std::string, std::unordered_set<std::string>> data;
    void loadFromFile();
    void saveToFile() const;
};
#endif // FILEDATAREPOSITORY_H
