import { useState } from 'react';
import goDropLogo from './assets/godrop.png';
import './App.css'; // Ensure this imports Tailwind CSS correctly
import Header from './Header';
import { checkAccount, createDatabase } from './utils';
import Database from './Database';
import { useEffect } from 'react';

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

function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Enter your email to receive a database connection string');  
  const [messageColor, setMessageColor] = useState('text-gray-600');
  const [showInfo, setShowInfo] = useState(false); // New state for info visibility
  const [loading, setLoading] = useState(false); // New state for loading spinner
  const [varificationCode, setVarificationCode] = useState(''); // New state for verification code
  const [databaseID, setDatabaseID] = useState(''); // New state for database ID
  const [displayCodeInput, setDisplayCodeInput] = useState(false); // New state for code input
  const [code, setCode] = useState(''); // New state for code input
  const [viewDB, setViewDB] = useState(false); // New state for viewing database
  const [userEmail, setUserEmail] = useState('');
  const [auth, setAuth] = useState(false);

  const resetMessage = () => {
    setMessage('Enter your email to receive a database connection string');
    setMessageColor('text-gray-600');
  }

  const verifyEmail = () => {
    if (!email) {
      setMessage('Please enter an email');
      setMessageColor('text-red-500');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email');
      setMessageColor('text-red-500');
      return false;
    }
    return true;
  }

  const verifyCode = async () => {
    if(!code || !varificationCode) {
      setMessage('Please enter the verification code');
      setMessageColor('text-red-500');
      return;
    }
    if(code !== varificationCode) {
      setMessage('The verification code is incorrect');
      setMessageColor('text-red-500');
      return;
    }
    if(databaseID) {
      setMessage('Here is your database connection string, go to the docs for more information');
      setAuth(true);
      setDisplayCodeInput(false);
      return;
    }
    setLoading(true);
    const result = await createDatabase(email);
    if(!result || result.error) {
      setMessage('There was an error creating your database');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    setDisplayCodeInput(false);
    setMessage('Here is your database connection string, go to the docs for more information');
    setDatabaseID(result.id);
    setUserEmail(email);
    setAuth(true);
    setLoading(false);
  }

  const verifyAccount = async () => {
    resetMessage();
    if(!verifyEmail()) return;
    setLoading(true);
    let code = Math.floor(100000 + Math.random() * 900000) + "";
    setVarificationCode(code);
    const result = await checkAccount(email, code);
    if(!result || result.error) {
      setMessage('There was an error checking your account');
      setMessageColor('text-red-500');
      setLoading(false);
      return;
    }
    setDatabaseID(result.id);
    setMessage('verification code sent to' + email);
    setMessageColor('text-blue-500');
    setDisplayCodeInput(true);
    setUserEmail(email);
    setLoading(false);
  };

  useEffect(() => {
    if(document && databaseID && email) {
      document.cookie = `databaseID=${databaseID};max-age=1800`;
      document.cookie = `email=${email};max-age=1800`;
    }
  }, [databaseID, userEmail]);

  useEffect(() => {
    const dbID = getDatabaseFromCookie('databaseID');
    const email = getDatabaseFromCookie('email');
    if(dbID && email) {
      setDatabaseID(dbID);
      setUserEmail(email);
      setAuth(true);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(databaseID).then(() => {
      setMessage('The connection string is copied to clipboard! Paste it in your code to use the database.');
      setMessageColor('text-blue-500');
    }, (err) => {
      console.error(err);
      setMessage('There was an error copying the connection string to clipboard');
      setMessageColor('text-red-500');
    });
  };

  if(viewDB) {
    return <Database setViewDB={setViewDB} email={userEmail} databaseID={databaseID} />;
  }

  return (
    <div className="min-h-screen bg-gray-800 py-6 flex flex-col justify-center sm:py-12">

      <Header setViewDB={setViewDB} user={userEmail}/>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to BsonDB</h1>
          <p className={`mb-4 ${messageColor}`}>{message}</p>
          <div className="flex items-center space-x-4">
            {
              databaseID && auth ? (
                <>
                  <input
                    type="email"
                    className="border-2 border-gray-400 p-2 w-full rounded-md"
                    placeholder="Enter your email"
                    value={databaseID}
                    readOnly
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    <i className="far fa-copy"></i>
                  </button>
                </>
              ) : !displayCodeInput ? (
                  <>
                    <input
                      type="email"
                      className="border-2 border-gray-300 p-2 w-full rounded-md"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      onClick={verifyAccount}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      {loading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                          'Validate'
                        )}
                    </button>
                  </>
                ) : (

                    <>
                      <input
                        type="number"
                        className="border-2 border-gray-300 p-2 w-full rounded-md"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <button
                        onClick={verifyCode}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      {loading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                          'Submit'
                        )}
                    </button>
                  </>
              )
            }
          </div>
          <div className="mt-4">
            <p className="text-gray-600">Don't know what you're doing?</p>
            <a href="https://www.npmjs.com/package/bsondb-api?activeTab=readme" className="text-blue-500 hover:underline">Read the docs</a>
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <i className="fas fa-info text-blue-500 cursor-pointer" onClick={() => setShowInfo(!showInfo)}></i>
            {showInfo && (
                <div className="absolute top-10 right-0 bg-gray-800 text-white p-2 rounded shadow-lg w-64 animate-fadeIn">
                  <p>
                    BsonDB is a database suitable for small projects that do not require the entirety of a cloud provider's services.
                  </p>
                </div>
            )}
          </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-4">
        <img src={goDropLogo} alt="GoDrop Logo" className="w-24" />
      </div>
    </div>
  );
}

export default App;

