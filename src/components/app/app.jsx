import { Navbar, Image } from "react-bootstrap";
import { Route } from "react-router-dom";
import { Home } from "../home/home";
import { Menu } from "../menu/menu";

import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";

const navItems = [
  { url: "/", name: "Home" },
  { url: "/menu", name: "Menu" }
];

export default function App() {

  // const history = useHistory();
  // useEffect(() => {
  //   if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
  //     sendToGoogleAnalytics(history.location);
  //     history.listen(location => {
  //       sendToGoogleAnalytics(location);
  //     });
  //   }
  // }, [history]);

  return (
    <div className="App">
      <Navbar
        // collapseOnSelect
        // expand="md"
        id="navbar"
        variant="light"
        bg="light"
      >
        <Navbar.Brand className="text-center" id="logo" href="#/">
          <Image fluid src="/logo.png"></Image>
        </Navbar.Brand>
        {/* <Navbar.Toggle /> */}
        {/* <Navbar.Collapse> */}
        {/* <Nav id="nav" defaultActiveKey={window.location.hash}>
          {navItems.map(({ url, name }) => (
            <Nav.Link key={name} href={`#${url}`}>
              <h4>
                <b>{name}</b>
              </h4>
            </Nav.Link>
          ))}
        </Nav> */}
        {/* </Navbar.Collapse> */}
      </Navbar>

      <Route exact path="/">
        <Home></Home>
      </Route>
      <Route path="/menu">
        <Menu></Menu>
      </Route>

      <Navbar id="aaa" sticky="bottom" variant="dark" bg="dark">
        <Navbar.Brand className="mx-auto footer-text">
          © 2025 Jumbo Dragon Chinese Restaurant | Brantford
        </Navbar.Brand>
      </Navbar>
    </div>
  );
}

function sendToGoogleAnalytics(location) {
  const pagePath = location.pathname || window.location.pathname;
  const pageTitle = navItems.find(item => item.url === pagePath)?.name;
  gtag('config', 'G-2SG6Y80TH9', { page_path: pagePath, page_title: pageTitle });
}
