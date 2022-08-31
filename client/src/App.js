import React, { useState, useEffect } from "react";
import { getToken } from "./tokens";

function App() {
  useEffect(() => {
    handleTokenFromQueryParams();
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eventList, setEventList] = useState([]);

  const createGoogleAuthLink = async () => {
    try {
      const request = await fetch("http://localhost:8080/createAuthLink", {
        method: "POST",
      });
      const response = await request.json();
      window.location.href = response.url;
    } catch (error) {
      console.log("App.js 12 | error", error);
      throw new Error("Issue with Login", error.message);
    }
  };

  const getMyGoogleCalendarsList = async () => {
    try {
      const token = await getToken();
      console.log(
        "googleCalendar.js 49 | getting calendar events with token",
        token
      );
      const request = await fetch(
        `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await request.json();
      console.log("googleCalendar.js 24 | got calendar events", data);
      return data;
    } catch (error) {
      console.log("googleCalendar.js 35 | error getting calendar data", error);
      return error.message;
    }
  };

  const getMyGoogleCalendarEventList = async () => {
    try {
      const token = await getToken();
      console.log(
        "googleCalendar.js 49 | getting calendar events with token",
        token
      );
      const request = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/calendarID/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await request.json();
      // console.log("calendar events", data.items);
      setEventList(data.items);
      return data;
    } catch (error) {
      console.log("error getting calendar data", error);
      return error.message;
    }
  };

  const handleTokenFromQueryParams = () => {
    const query = new URLSearchParams(window.location.search);
    const accessToken = query.get("accessToken");
    const refreshToken = query.get("refreshToken");
    const expirationDate = newExpirationDate();
    console.log("App.js 30 | expiration Date", expirationDate);
    if (accessToken && refreshToken) {
      storeTokenData(accessToken, refreshToken, expirationDate);
      setIsLoggedIn(true);
    }
  };

  const newExpirationDate = () => {
    var expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return expiration;
  };

  const storeTokenData = async (token, refreshToken, expirationDate) => {
    sessionStorage.setItem("accessToken", token);
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem("expirationDate", expirationDate);
  };

  const signOut = () => {
    setIsLoggedIn(false);
    sessionStorage.clear();
  };

  const eventsArry = () => {
    return eventList.map((item, index) => (
      <li key={index} style={{ marginBottom: "10px" }}>{`Summary=${
        item.summary
      } Start=${item.start.dateTime || item.start.date}`}</li>
    ));
  };

  return (
    <div className="App">
      <h1>Google</h1>
      {!isLoggedIn ? (
        <button onClick={createGoogleAuthLink}>Login</button>
      ) : (
        <>
          <button onClick={getMyGoogleCalendarsList}>
            Get Google Calendars
          </button>
          <button onClick={getMyGoogleCalendarEventList}>
            Get Google Calendar Eventes
          </button>
          <button onClick={signOut}>Sign Out</button>
          <br />
          <ul>
            <li style={{ marginBottom: "10px" }}>
              Events Count={eventList.length}
            </li>
            {eventList.length > 0 && eventsArry()}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
