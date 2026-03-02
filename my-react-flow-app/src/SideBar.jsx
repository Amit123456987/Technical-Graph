import React from "react";
import { useEffect, useState } from "react";


const Sidebar = ({ onItemClick, handleDelete }) => {
  const apps = [];
  const [previousItems, setPreviousItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/list/maps")
      .then((response) => response.json())
      .then((data) => {
        const items = data.maps.map((item) => item.name);
        return (items)
      }
      )
      .then((data) => setPreviousItems(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const styles = {
    sidebar: {
      width: '260px',
      height: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '16px',
      overflowY: 'auto',
      fontFamily: 'sans-serif',
    },
    sectionTitle: {
      fontSize: '10px',
      textTransform: 'uppercase',
      color: 'gray',
      margin: '16px 0 8px',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    icon: {
      width: '24px',
      height: '24px',
      backgroundColor: '#555',
      borderRadius: '50%',
      marginRight: '8px',
    },
    smallIcon: {
      width: '16px',
      height: '16px',
      backgroundColor: '#777',
      borderRadius: '4px',
      marginRight: '8px',
    },
    todayItem: {
      backgroundColor: '#333',
      padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    topIcons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px',
    },
    topIconGroup: {
      display: 'flex',
      gap: '8px',
    },
    topIcon: {
      width: '24px',
      height: '24px',
      backgroundColor: '#777',
      borderRadius: '6px',
    },
    text: {
      fontSize: '14px',
    },
  };

  // const handleDelete = (itemToDelete) => {
  //   setPreviousItems((prevItems) =>
  //     prevItems.filter((item) => item !== itemToDelete)
  //   );
  // };

  return (
    <div style={styles.sidebar}>
      {/* Top Icons */}
      <div style={styles.topIcons}>
        <div style={styles.topIconGroup}>
          <div style={styles.topIcon} />
          <div style={styles.topIcon} />
        </div>
        <div style={styles.topIcon} />
      </div>

      {/* Apps Section */}
      {apps.map((app, idx) => (
        <div key={idx} style={styles.item}>
          <div style={styles.icon}></div>
          <span style={styles.text}>{app}</span>
        </div>
      ))}

      {/* Projects */}
      <div style={styles.sectionTitle}>Projects</div>
      <div style={styles.item}>
        <div style={styles.smallIcon}></div>
        <span style={styles.text}>ew</span>
      </div>

      {/* Today */}
      <div style={styles.sectionTitle}>Today</div>
      <div style={styles.todayItem}>OBPP Platform Structures</div>

      {/* Previous 7 Days */}
      <div style={styles.sectionTitle}>Previous 7 Days</div>
      {previousItems.map((item, idx) => (
        <div key={idx} style={styles.item}>
          <span style={styles.text} onClick={() => onItemClick(item)}>
            {item}
          </span>
          <button
            style={{
              marginLeft: "8px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
            onClick={() => handleDelete(item)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
