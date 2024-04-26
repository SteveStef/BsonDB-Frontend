const server = import.meta.env.VITE_SERVER_URL;

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

const getToken = (name) => {
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith(name));
  if (!cookie) return null;
  return cookie.split('=')[1];
};

async function deleteDatabase(id, email) {
  const token = getToken('token');
  defaultHeaders['Authorization'] = token;
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

export { deleteDatabase, getTable, getDatabaseTblNames };

