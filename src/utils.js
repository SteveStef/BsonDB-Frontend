
const server = import.meta.env.VITE_SERVER_URL;
const auth = import.meta.env.VITE_AUTHORIZATION;

const defaultHeaders = { 'Content-Type': 'application/json' };

const apiRequest = async (method, path, body = null) => {
  const requestOptions = {
    method,
    headers: defaultHeaders,
    ...(body && { body: JSON.stringify(body) })
  };
  const url = `${server}${path}`;
  try {
    const response = await fetch(url, requestOptions);
    return await response.json();
  } catch (error) {
    return null;
  }
};

async function checkAccount(email, code) {
  defaultHeaders['Authorization'] = auth;
  let response = await apiRequest('POST', `/api/check-account`, { email, code });
  defaultHeaders['Authorization'] = null;
  return response;
}

async function createDatabase(email) {
  defaultHeaders['Authorization'] = auth;
  let result = await apiRequest('POST', '/api/createdb', {email});
  defaultHeaders['Authorization'] = null;
  return result;
}

async function deleteDatabase(id, email) {
  defaultHeaders['Authorization'] = auth;
  let body = { databaseId: id, email };
  let result = await apiRequest('POST', `/api/deletedb`, body);
  defaultHeaders['Authorization'] = null;
  return result;
}

async function getTable(databaseId, tableName) {
  let body = { databaseId, table: tableName};
  return await apiRequest("POST", `/api/table`, body);
}

async function getDatabaseTblNames(databaseId) {
  return await apiRequest("POST", `/api/database-names`, { databaseId });
}

export { checkAccount, createDatabase, deleteDatabase, getTable, getDatabaseTblNames };

