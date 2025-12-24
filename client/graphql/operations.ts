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
    }
  }
`;

export const BOARDS = gql`
  query Boards {
    boards {
      id
      title
      visibility
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

export const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      id
      title
      order
      boardId
    }
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
