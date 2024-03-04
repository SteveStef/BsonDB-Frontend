import { useState } from 'react';
import goDropLogo from './assets/godrop.png';
import Header from './Header';
import { useEffect } from 'react';
import { deleteDatabase, getTable, getDatabaseTblNames } from './utils';

const getDatabaseFromCookie = (name) => {
  const cookie = document.cookie.split(';');
  for (let i = 0; i < cookie.length; i++) {
    let c = cookie[i];
    if(c.includes(name)) {
      return c.split('=')[1];
    }
  }
  return '';
};

function Database({ setViewDB, email, databaseID }) {
  const [database, setDatabase] = useState(databaseID || getDatabaseFromCookie('databaseID'));
  const [userEmail, setUserEmail] = useState(email || getDatabaseFromCookie('email'));
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('text-gray-600');
  const [tableNames, setTableNames] = useState([]);
  const [tables, setTables] = useState([]);
  const [maxColumns, setMaxColumns] = useState({});
  const [viewTable, setViewTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [currentTable, setCurrentTable] = useState('');

  const deleteDB = async () => {
    setLoading(true);
    if(!database || !userEmail) {
      setMessage('Enter your email in the first page... idk who you are');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    const result = await deleteDatabase(database, userEmail);
    if(!result || result.error) {
      setMessage('There was an error deleting your database');
      setMessageColor('text-red-500');
      return;
    }
    setLoading(false);
    setModal(false);
    document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'databaseID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    window.location.reload();
  }

  const fetchDB = async () => {
    setLoading(true);
    if(!database || !userEmail) {
      setMessage('Enter your email in the first page... idk who you are');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    const result = await getDatabaseTblNames(database);
    if(!result || result.error) {
      setMessage('There was error');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    if(result.length === 0) {
      setTableNames([]);
    } else if(result.length === 1 && result[0] === '') {
      setTableNames([]);
    } else {
      setTableNames(result);
    }
    setLoading(false);
  }

  const fetchTable = async (tableName) => {
    setLoading(true);
    if(!database || !userEmail) {
      setMessage('Enter your email in the first page... idk who you are');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    const result = await getTable(database, tableName);
    if(!result || result.error) {
      setMessage('There was error retrieving the database tables');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }

    function maxKeysInObjectsArray(array) {
      let maxKeys =  0;
      let largestObj = {};
      array.forEach(obj => {
        const keysCount = Object.keys(obj).length;
        if (keysCount > maxKeys) {
          maxKeys = keysCount;
          largestObj = obj;
        }
      });

      return largestObj;
    }

    setMaxColumns(maxKeysInObjectsArray(result));
    setTables(result);
    setLoading(false);
  }

  useEffect(() => {
    if(database && userEmail) fetchDB();
    else {
      setMessage('Enter your email in the first page... idk who you are');
      setMessageColor('text-red-600');
      setLoading(false);
    }
  }, [database, userEmail]);

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-center sm:py-12 w-full max-h-screen">
      <Header setViewDB={setViewDB} user={userEmail}/>
      <div className="relative py-3 sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-gray-100 shadow-lg sm:rounded-3xl sm:p-20 max-w-screen-xl mx-auto overflow-y-auto" 
          style={{minWidth: "700px", maxHeight: '1000px'}}>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                if(!viewTable) setViewDB(false);
                setViewTable(false);
              }}
              className="text-gray px-2 py-2 rounded-md mt-4"
            >
              <i className="fas fa-arrow-left"></i> Back
            </button>

            {viewTable && (
              <button
                onClick={() => fetchTable(currentTable)}
                className="text-gray px-2 py-2 rounded-md "
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4 p-2">Database Table</h1>

          <p className={`mb-4 ${messageColor}`}>{message}</p>

          {
            loading ? (
              <div className="flex justify-center items-center">
                <i className="fas fa-spinner fa-spin " style={{fontSize: "25px", margin: "20px"}}></i>
            </div>
            ) 
            : viewTable ? (
              <div className="overflow-x-auto" style={{ maxHeight: "450px"}}>
                  { tables.length === 0 && <div>No data in this table</div> }
                <table className="min-w-full divide-y divide-gray-200" style={{maxHeight: "300px"}}>
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.entries(maxColumns).map(([key, _], index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tables.map((obj, i) => (
                      <tr key={i}>
                        {Object.values(obj).map((value, index) => (
                          <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto" style={{ maxHeight: "450px"}}>
                  {
                    tableNames.map((name, i) => {
                      return (
                        <div key={i} className="p-4 border rounded-md mb-4">
                          <div className="flex justify-between items-center">
                          <h2 className="text-xl font-semibold">{name}</h2>
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => {
                                  setViewTable(true)
                                  fetchTable(name)
                                  setCurrentTable(name)
                                }}
                              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                              View Table
                            </button>
                          </div>
                        </div>
                      </div>
                      )
                    }
                    )
                  }
                </div>
              )
          }

          {
            !loading && !viewTable && userEmail && database && tableNames && tableNames.length === 0 && (
              <div>You have not created any tables yet</div>
            )
          }

          {!loading && !viewTable && userEmail && database && (
          <button
            onClick={() => setModal(true)}
            className="bg-red-500 hover:bg-red-700 text-white px-2 py-2 rounded-md mt-4"
          >
            Delete Database
          </button>
          )}


          {
            modal && (
              <div id="modal" className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-md w-full max-w-3xl"> {/* Adjusted width here */}
                  <h2 className="text-2xl font-semibold mb-4 text-center">All data will be lost!</h2> {/* Larger text and centered */}
                  <p className="mb-6 text-center text-gray-600">Are you sue you want to delete your BsonDB database?</p> {/* Centered and smaller margin */}
                  <div className="flex justify-center space-x-4"> {/* Centered buttons and space between */}
                    <button onClick={deleteDB} className="bg-red-500 hover:bg-red-700 text-white px-6 py-3 rounded-md">
                      Delete
                    </button>
                    <button onClick={() => setModal(false)} className="bg-gray-500 hover:bg-gray-700 text-white px-6 py-3 rounded-md">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )
          }

        </div>
      </div>

      <div className="absolute bottom-0 right-0 p-4">
        <img src={goDropLogo} alt="GoDrop Logo" className="w-24" />
      </div>
    </div>
  );
}

export default Database;

