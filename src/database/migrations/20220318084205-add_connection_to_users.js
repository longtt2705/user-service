'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Users', 'googleConnection', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'facebookConnection', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'twitterConnection', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
      queryInterface.addColumn('Users', 'tiktokConnection', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users', 'googleConnection'),
      queryInterface.removeColumn('Users', 'facebookConnection'),
      queryInterface.removeColumn('Users', 'twitterConnection'),
      queryInterface.removeColumn('Users', 'tiktokConnection'),
    ])
  },
}
