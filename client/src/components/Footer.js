import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <div className="footer">
      <Container>
        <Row>
          <Col className="one" lg="3">
            <div className="title">About</div>
            <div className="desc">
              <ul>
                <li>
                  CrypBot is a bot.
                  <br />
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Footer;
