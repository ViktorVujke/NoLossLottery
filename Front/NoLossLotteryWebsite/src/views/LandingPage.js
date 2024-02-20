/*!

=========================================================
* BLK Design System React - v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/blk-design-system-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/blk-design-system-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState } from "react";
// react plugin used to create charts
import { Line } from "react-chartjs-2";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  ListGroupItem,
  ListGroup,
  Container,
  Row,
  Col,
} from "reactstrap";

// core components
import Footer from "components/Footer/Footer.js";
import IndexNavbar from "components/Navbars/IndexNavbar";
import bigChartData from "variables/charts.js";
import ViewLotteriesSection from "components/Sections/JoinLottery/ViewLotteriesSection";
import {NextUIProvider} from "@nextui-org/react";
import DarkLotteriesTable from "components/Sections/SectionComponents/DarkLotteriesTable";
import CreateLotterySection from "components/Sections/CreateLottery/CreateLotterySection";
import CreateLotteryForm from "components/Sections/CreateLottery/CreateLotteryForm";
import CreateLotteryModal from "components/Sections/CreateLottery/CreateLotteryModal";

export default function LandingPage() {

  const [isModalOpen, setIsModalOpen] = useState(false)

  React.useEffect(() => {
    document.body.classList.toggle("landing-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("landing-page");
    };
  }, []);
  return (
    <NextUIProvider>
      <IndexNavbar />
      <div className="wrapper">
        <div className="page-header">
          <img
            alt="..."
            className="path"
            src={require("assets/img/blob.png")}
          />
          <img
            alt="..."
            className="path2"
            src={require("assets/img/path2.png")}
          />
          <img
            alt="..."
            className="shapes triangle"
            src={require("assets/img/triunghiuri.png")}
          />
          <img
            alt="..."
            className="shapes wave"
            src={require("assets/img/waves.png")}
          />
          <img
            alt="..."
            className="shapes squares"
            src={require("assets/img/patrat.png")}
          />
          <img
            alt="..."
            className="shapes circle"
            src={require("assets/img/cercuri.png")}
          />
          <div className="content-center">
            <Row className="row-grid justify-content-between align-items-center text-left">
              <Col lg="6" md="6">
                <h1 className="text-white">
                 Gamble without loss<br />
                  <span className="text-white"></span>
                </h1>
                <p className="text-white mb-3">
                  You want to stake your crypto, but are also a degenerate gambler? NLL is the protocol for you.
                  We offer you a way of participaiting in lotteries (with a nice upside), without the chance of getting out less than you put in.
                </p>
                <div className="btn-wrapper mb-3">
                  <p className="category text-success d-inline">
                    See our docs
                  </p>
                  <Button
                    className="btn-link"
                    color="success"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    <i className="tim-icons icon-minimal-right" />
                  </Button>
                </div>
                <div className="btn-wrapper">
                  <div className="button-container">
                    <Button
                      className="btn-icon btn-simple btn-round btn-neutral"
                      color="default"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="fab fa-twitter" />
                    </Button>
                   
                  </div>
                </div>
              </Col>
              <Col lg="4" md="5">
                <img
                  alt="..."
                  className="img-fluid"
                  src={require("assets/img/etherum.png")}
                />
              </Col>
            </Row>
          </div>
        </div>
        <section  style={{  }}>
        <div className="responsive-container" style={{ padding: "20px", color: "#FFFFFF" }}>
          <ViewLotteriesSection />
        </div>
      </section>
      <section style={{  }}>
        <div className="responsive-container" style={{ color: "#FFFFFF" }}>
          <CreateLotterySection openLotteryCreateModal={setIsModalOpen}/>
        </div>
      </section>        
      <section className="section section-lg">
          
        </section>
        <section className="section section-lg">
          <img
            alt="..."
            className="path"
            src={require("assets/img/path4.png")}
          />
          <img
            alt="..."
            className="path2"
            src={require("assets/img/path5.png")}
          />
          <img
            alt="..."
            className="path3"
            src={require("assets/img/path2.png")}
          />
          <Container>
            <Row className="justify-content-center">
              <Col lg="12">
                <h1 className="text-center" style={{marginTop:40}}>Why WhiteBean</h1>
                <Row className="row-grid justify-content-center">
                  <Col lg="3">
                    <div className="info">
                      <div className="icon icon-primary">
                        <i className="tim-icons icon-money-coins" />
                      </div>
                      <h4 className="info-title">No loss</h4>
                      <hr className="line-primary" />
                      <p>
                       Our protocol gives you the pleasure of gambling, without the risk of loss.
                      </p>
                    </div>
                  </Col>
                  <Col lg="3">
                    <div className="info">
                      <div className="icon icon-warning">
                        <i className="tim-icons icon-chart-pie-36" />
                      </div>
                      <h4 className="info-title">High rewards</h4>
                      <hr className="line-warning" />
                      <p>
                       You could earn more than your original stake, if you are lucky.
                      </p>
                    </div>
                  </Col>
               
                </Row>
              </Col>
            </Row>
          </Container>
        </section>


      <CreateLotteryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <Footer />
      </div>
      </NextUIProvider>  );
}
