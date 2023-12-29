import { MasterLayout } from "@components";
import React from "react";
import { Card, Nav } from "react-bootstrap";

export default function Website() {
  return (
    <MasterLayout>
      <Card>
        <Card.Body>
          <Nav variant="tabs" defaultActiveKey="link-1">
            <Nav.Item>
              <Nav.Link eventKey="link-1">Header Slides</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="link-2">Serviços</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="link-3">SVA</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>
    </MasterLayout>
  );
}
