import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
        avatarUrl
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        status
        avatarUrl
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
      name
      role
      status
      avatarUrl
    }
  }
`;

export const BOARDS = gql`
  query Boards {
    boards {
      id
      title
      visibility
      description
      cover
      isArchived
    }
  }
`;

export const BOARD = gql`
  query Board($id: ID!) {
    board(id: $id) {
      id
      title
      visibility
      ownerId
    }
  }
`;

export const LISTS = gql`
  query Lists($boardId: ID!) {
    lists(boardId: $boardId) {
      id
      title
      order
      color
      wipLimit
      isArchived
    }
  }
`;

export const LIST = gql`
  query List($id: ID!) {
    list(id: $id) {
      id
      boardId
      title
      order
      color
      wipLimit
      isArchived
    }
  }
`;

export const TASKS = gql`
  query Tasks($listId: ID!) {
    tasks(listId: $listId) {
      id
      listId
      title
      description
      status
      priority
      tags
    }
  }
`;

export const TASK = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      listId
      title
      description
      status
      priority
      tags
      assigneeId
      dueDate
    }
  }
`;

export const CREATE_BOARD = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      title
      visibility
    }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($input: UpdateBoardInput!) {
    updateBoard(input: $input) {
      id
      title
      description
      visibility
      cover
      isArchived
    }
  }
`;

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`;

export const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      title
      order
      boardId
      color
      wipLimit
      isArchived
    }
  }
`;

export const UPDATE_LIST = gql`
  mutation UpdateList($input: UpdateListInput!) {
    updateList(input: $input) {
      id
      title
      order
      boardId
      color
      wipLimit
      isArchived
    }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id)
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      listId
      status
      priority
      tags
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      listId
      title
      description
      status
      priority
      tags
    }
  }
`;

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      title
      listId
      status
      priority
      tags
    }
  }
`;

export const TASK_UPDATED_SUB = gql`
  subscription TaskUpdated($boardId: ID!) {
    taskUpdated(boardId: $boardId) {
      type
      task {
        id
        listId
        title
        status
        priority
        tags
      }
    }
  }
`;

export const MOVE_TASK = gql`
  mutation MoveTask($input: MoveTaskInput!) {
    moveTask(input: $input) {
      id
      listId
      title
      status
      priority
      tags
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      role
      status
      avatarUrl
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const USERS = gql`
  query Users {
    users {
      id
      email
      name
      role
      status
      avatarUrl
    }
  }
`;

export const SET_USER_ROLE = gql`
  mutation SetUserRole($input: SetUserRoleInput!) {
    setUserRole(input: $input) {
      id
      email
      name
      role
      status
      avatarUrl
    }
  }
`;

export const SET_USER_STATUS = gql`
  mutation SetUserStatus($input: SetUserStatusInput!) {
    setUserStatus(input: $input) {
      id
      email
      name
      role
      status
      avatarUrl
    }
  }
`;
