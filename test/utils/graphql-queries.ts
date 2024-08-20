export const GET_USER_CATEGORIES = `
  query {
    getUserCategories {
      id
      name
      description
      user {
        id
        email
      }
    }
  }
`;