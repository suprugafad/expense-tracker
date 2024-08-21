export const LOGIN_USER_MUTATION = `
mutation LoginUser($email: String!, $password: String!){
  loginUser(loginUserInput: { email: $email, password: $password }) {
    access_token
  }
}
`;

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

export const CREATE_CATEGORY_MUTATION = `
mutation CreateCategory($name: String!, $description: String) {
  createCategory(createCategoryInput: { name: $name, description: $description }) {
    id
    name
    description
  }
}
`;

export const UPDATE_CATEGORY_MUTATION = `
mutation UpdateCategory($id: ID!, $name: String, $description: String) {
  updateCategory(id: $id, updateCategoryInput: { name: $name, description: $description }) {
    id
    name
    description
  }
}
`;

export const DELETE_CATEGORY_MUTATION = `
mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id) {
    success
  }
}
`;
