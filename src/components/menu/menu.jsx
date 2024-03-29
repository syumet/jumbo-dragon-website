import { useState, useEffect } from "react";
import {
  Accordion,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert
} from "react-bootstrap";

import "./menu.css";

export const Menu = () => {
  const [menu, setMenu] = useState();
  const [menuShortDescription, setMenuShortDescription] = useState();
  const [menuLongDescription, setMenuLongDescription] = useState();
  const [menuCategoryOrder, setMenuCategoryOrder] = useState([]);
  const [shouldShowAllergyAlert, setIsShowAllergyAlert] = useState(true);
  useEffect(() => {
    async function fetchAndSetMenu() {
      setMenuCategoryOrder(await (await (await fetch("/assets/menu-category-order.txt")).text()).split('\n'));

      let menuItems = await (await (fetch("/assets/menu.json"))).json();
      // try {
      //   menuItems = await (await (fetch("http://localhost:5000/menu/item"))).json();
      // } catch (error) { }

      let menuCategories = await (await (fetch("/assets/menu-category-info.json"))).json();
      const menuShortDescription = {};
      const menuLongDescription = {};

      for (const category of menuCategories) {
        menuShortDescription[category.name] = category.shortDescription
        menuLongDescription[category.name] = category.longDescription
      }
      setMenuShortDescription(menuShortDescription)
      setMenuLongDescription(menuLongDescription)

      const menu = {};
      for (const menuItem of menuItems) {
        const menuItemsInCategory = menu[menuItem.category];
        if (menuItemsInCategory) {
          menuItemsInCategory.push(menuItem);
        } else {
          menu[menuItem.category] = [menuItem];
        }
      }
      setMenu(menu);
    }
    fetchAndSetMenu();
  }, []);

  return (
    <Container id="menu-container">
      {shouldShowAllergyAlert && (
        <Alert
          className="my-1"
          variant="danger"
          onClose={() => setIsShowAllergyAlert(false)}
          dismissible
        >
          <ul>
            <li>Please notify us of any allergies you may have.</li>
            <li>Any unlisted order or side order may be made by request.</li>
            <li>You can choose your 🌶️ level: Mild, Medium, Very Spicy or Non-spicy.</li>
          </ul>
        </Alert>
      )}
      <h1>
        Menu
      </h1>
      <hr className="mt-0" />
      {Object.entries(menu || {})
        .sort((a, b) => menuCategoryOrder.indexOf(a[0]) - menuCategoryOrder.indexOf(b[0]))
        .map(([category, menuItems], i) => (
          <Accordion id={`menu-category-${i}`} key={i}>
            <Card className="my-1" border="dark">
              <Accordion.Toggle className="menu-category-header" as={Card.Header} variant="link" eventKey="0">
                {category} {menuShortDescription[category] && menuShortDescription[category] !== "" && (
                  <small>({menuShortDescription[category]})</small>
                )}
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  {menuLongDescription[category] && menuLongDescription[category] !== "" && (
                    <Alert className="cat-info" variant="dark">
                      {menuLongDescription[category]}
                    </Alert>
                  )}
                  <Row>
                    {menuItems?.map((menuItem, i) => (
                      <Col key={i} xs={12} md={6} lg={4}>
                        <Accordion>
                          <Card className="my-1 menu-item-card" border="dark">
                            <Card.Body>
                              <Card.Text className="my-0 menu-item-name">
                                {menuItem.code ? `${menuItem.code}. ` : ""}
                                {menuItem.name}
                                {menuItem.spicyLevel > 0 && (
                                  <span role="img" aria-label="chill" title="Spicy">
                                    🌶️
                                  </span>
                                )}
                                {menuItem.hasPeanuts > 0 && (
                                  <span
                                    role="img"
                                    aria-label="peanuts"
                                    title="Has Peanuts"
                                  >
                                    🥜
                                  </span>
                                )}
                              </Card.Text>
                              <Card.Text className="my-0 menu-item-price">
                                ${(+menuItem.price).toFixed(2)}
                              </Card.Text>
                              {menuItem.description && (
                                <Accordion.Toggle
                                  className="my-0 menu-item-detail-toggle"
                                  as={Card.Text}
                                  variant="link"
                                  eventKey="1"
                                >
                                  Details+
                                </Accordion.Toggle>
                              )}
                              {menuItem.description && (
                                <Accordion.Collapse eventKey="1">
                                  <div>
                                    {menuItem.description.split("\n").map((line, i) => (
                                      <Card.Text
                                        key={i}
                                        className="my-0 menu-item-description"
                                      >
                                        {line}
                                      </Card.Text>
                                    ))}
                                  </div>
                                </Accordion.Collapse>
                              )}
                            </Card.Body>
                          </Card>
                        </Accordion>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        ))}
    </Container>
  );
};
