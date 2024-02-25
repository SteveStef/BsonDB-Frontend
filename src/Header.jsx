import { useState } from 'react';

const Header = ({ setViewDB, user }) => {

  const [show, setShow] = useState(false);

  const logout = () => {
    document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'databaseID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div onClick={() => setViewDB(false)} className="text-lg font-semibold cursor-pointer">
          BsonDB
        </div>
        <nav className="flex space-x-4">
          <span onClick={() => setViewDB(false)}className="hover:text-gray-300 cursor-pointer">Home</span>
          <span onClick={() => {
            setViewDB(true)
          }}
          className="hover:text-gray-300 cursor-pointer">My Database</span>
          <span onClick={() => setShow(true)} className={`${user ? "cursor-pointer" : ""}`}>{user || "Guest"}</span>

          {show && user && (
            <div className="absolute top-11 right-12 bg-gray-500 text-white p-2 rounded shadow-lg w-64 animate-fadeIn">
              <div onClick={logout} className="hover:bg-gray-700 p-2 rounded cursor-pointer">Logout</div>
              <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-2xl">&times;</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
