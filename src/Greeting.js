import React from 'react';
import './Greeting.css';
function Greeting() {
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  let timeOfDayGreeting;
  if (currentHour < 12) timeOfDayGreeting = 'Good morning!';
  else if (currentHour < 18) timeOfDayGreeting = 'Good afternoon!';
  else timeOfDayGreeting = 'Good evening!';
  const dateTimeOptions = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  const formattedDateTime = currentDate.toLocaleString('en-US', dateTimeOptions);
  return (
    <div className="greeting-container">
      <p className="time-greeting">{timeOfDayGreeting}</p>
      <p className="date-greeting">{formattedDateTime}</p>
    </div>
  );
}
export default Greeting;