import React, { useState } from "react";
import { Form, Col, Button, InputGroup, FormControl } from "react-bootstrap";

const EditCurrencyCard = (props) => {
  const [exchange, setExchange] = useState(props.exchange);
  const [symbol, setSymbol] = useState(props.symbol);
  const [name, setName] = useState(props.name);
  const [currencyId, setCurrencyId] = useState(props.currencyId);
  const [exchangeSymbol, setExchangeSymbol] = useState(props.exchangeSymbol);
  const [minimumBalance, setMinimumBalance] = useState(props.minimumBalance);

  return (
    <Col xs="12" sm="12" md="12" lg="12" xl="12">
      <div className="center-form mt-5">
        <Form className="p-3">
          <Form.Group controlId={props.exchange}>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                value={exchange}
                placeholder="Exchange"
                onChange={({ target: { value } }) => setExchange(value)}
              />
              <InputGroup.Append>
                <InputGroup.Text style={{ fontSize: "15px" }}>
                  Exchange
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                value={symbol}
                placeholder="Symbol"
                onChange={({ target: { value } }) => setSymbol(value)}
              />
              <InputGroup.Append>
                <InputGroup.Text style={{ fontSize: "15px" }}>
                  Symbol
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                placeholder="Name"
                value={name}
                onChange={({ target: { value } }) => setName(value)}
              />
              <InputGroup.Append>
                <InputGroup.Text style={{ fontSize: "15px" }}>
                  Name
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                placeholder=""
                value={currencyId}
                // onChange={({ target: { value } }) => setCurrencyId(value)}
                disabled
              />
              <InputGroup.Append>
                <InputGroup.Text style={{ fontSize: "15px" }}>
                  Currency Id
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                placeholder="Exchange Symbol"
                value={exchangeSymbol}
                onChange={({ target: { value } }) => setExchangeSymbol(value)}
              />
              <InputGroup.Append>
                <InputGroup.Text style={{ fontSize: "15px" }}>
                  Exchange Symbol
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
            <InputGroup className="mb-3">
              <FormControl
                type="text"
                placeholder="Maximum Seconds"
                value={minimumBalance}
                onChange={({ target: { value } }) => setMinimumBalance(value)}
              />
              <InputGroup.Append>
                <InputGroup.Text style={{ fontSize: "15px" }}>
                  Min Balance
                </InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                Button
                variant="dark"
                onClick={() =>
                  props.exchangeCurrencyUpdate({
                    exchange,
                    symbol,
                    name,
                    currencyId,
                    exchangeSymbol,
                    minimumBalance,
                  })
                }
                className={props.isLoading ? "disabled" : ""}
              >
                Save
              </Button>
            </div>
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
};
export default EditCurrencyCard;
