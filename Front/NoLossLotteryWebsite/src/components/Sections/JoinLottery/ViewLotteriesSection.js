import React from 'react';
import DarkLotteriesTable from "../SectionComponents/DarkLotteriesTable";
import styled from 'styled-components';

const ResponsiveContainer = styled.div`
  padding: 20px;
  color: #FFFFFF;
  margin: 0 auto;

  @media (min-width: 1024px) {
    max-width: 80%;
  }

  @media (max-width: 768px) {
    max-width: 95%;
  }
`;

const Title = styled.h2`
  color: #FFFFFF; // Adjust the color to fit your dark theme
  text-align: center; // Center the title if you like
  margin-bottom: 20px; // Adds some space between the title and the content below
`;

const Description = styled.p`
  color: #CCCCCC; // Lighter text color for the paragraph for readability
  margin-bottom: 20px; // Space before the table
  text-align: justify; // Justify the paragraph for better readability
  line-height: 1.5; // Increase line height for readability
`;

function ViewLotteriesSection() {
    return (
        <section className="section section-md" style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
            <Title>Ongoing Lotteries</Title>
            <Description>
                Here you can see all available lotteries and filter them by tokens, total value, days to end, and more. This enables you to easily find the lotteries that match your interests and investment criteria.
            </Description>
            <ResponsiveContainer>
                <DarkLotteriesTable />
            </ResponsiveContainer>
        </section>    
    );
}

export default ViewLotteriesSection;
