import React from "react";

import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs } from "@fortawesome/free-solid-svg-icons";

export default function IconCard(props) {
  const className = "icon-card " + props.className || "";
  return (
    <div className={className}>
      <Row>
        <Col className="icon-card__icon" xs={4} sm={4} md={4} lg={4}>
          <FontAwesomeIcon icon={props.icon || faCogs} size="4x" />
        </Col>
        <Col className="icon-card__body" xs={8} sm={8} md={8} lg={8}>
          <div className="icon-card__body--title">{props.title}</div>
          <div className="icon-card__body--text">{props.text}</div>
        </Col>
      </Row>
    </div>
  );
}
