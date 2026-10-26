#ifndef IDATAREPOSITORY_H
#define IDATAREPOSITORY_H

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>

class IDataRepository {
public:
    virtual ~IDataRepository() = default;
    //Adding products to the user
    virtual void addProducts(const std::string& userId,
         const std::vector<std::string>& productIds) = 0;
    //Give me the data.
    virtual std::unordered_map<std::string, std::unordered_set<std::string>>
        getAllUsersData() const = 0;
    
    // return if the user is already in the repository
    virtual bool userExists(const std::string& userId) const = 0;
    // get the user id and the products and delete them from the data
    virtual void removeProducts(const std::string& userId, const std::vector<std::string>& productIds) = 0;
    // find if the user has the product
    virtual bool hasProduct(const std::string& userId, const std::string& productId) const = 0;
};

#endif //IDATAREPOSITORY.H