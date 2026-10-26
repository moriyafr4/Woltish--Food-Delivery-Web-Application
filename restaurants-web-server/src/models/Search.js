const Restaurant = require('./Restaurant');

class Search {
  static async searchRestaurantsAndProducts(query) {
    const lowerQuery = query.toLowerCase();

    const allRestaurants = await Restaurant.getAllRestaurants();

    const resultsWithScores = [];

    allRestaurants.forEach(rest => {
      let score = 0;

      const nameMatch = rest.name.toLowerCase().includes(lowerQuery);
      const categoryMatch = rest.category && rest.category.toLowerCase().includes(lowerQuery);
      const descMatch = rest.description && rest.description.toLowerCase().includes(lowerQuery);

      const productMatch = rest.products && rest.products.some(prod =>
        prod.name.toLowerCase().includes(lowerQuery) ||
        (prod.description && prod.description.toLowerCase().includes(lowerQuery))
      );

      if (nameMatch) {
        // If it starts with the query, give it an even higher score
        if (rest.name.toLowerCase().startsWith(lowerQuery)) {
          score += 50;
        } else {
          score += 40;
        }
      } else if (categoryMatch) {
        score += 30;
      } else if (descMatch) {
        score += 20;
      } else if (productMatch) {
        score += 10;
      }

      if (score > 0) {
        resultsWithScores.push({ restaurant: rest, score });
      }
    });

    resultsWithScores.sort((a, b) => b.score - a.score);
    return resultsWithScores.map(item => item.restaurant);
  }
}

module.exports = Search;