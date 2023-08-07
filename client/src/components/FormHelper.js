import React from "react";

import { Row, Col, Card, Button, FormControl } from "react-bootstrap";

export const RenderInput = (props) => {
  let labelCol = props.labelCol || 4;
  let labelColLg = props.labelColLg || labelCol;
  let labelColMd = props.labelColMd || labelColLg;
  let labelColSm = props.labelColSm || labelColMd;

  return (
    <Row className="render-input">
      <Col md={labelColMd} lg={labelColLg} sm={labelColSm} xs={12}>
        {props.label}
      </Col>
      <Col md={12 - labelColMd} lg={12 - labelColLg} sm={12 - labelColSm} xs={12}>
        {props.element}
      </Col>
    </Row>
  );
};
