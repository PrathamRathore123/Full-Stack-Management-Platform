import React from 'react';
import Homeone from './Homeone.jsx';
// import Hometwo from './Hometwo.jsx';
import Homethree from './Homethree.jsx';
import Homefour from './Homefour.jsx';
import Homefive from './Homefive.jsx';
import AdminSetup from './AdminSetup.jsx';
import Homesix from './Homesix.jsx';

export default function Home() {
  // Removed the redirect logic since it's already handled in PublicLayout

  return (
    <>
      <Homeone />
      {/* <Hometwo /> */}
      <Homethree />
      <Homefour />
      <Homefive />
      {/* <AdminSetup /> */}
      {/* <Homesix/> */}
    </>
  );
}