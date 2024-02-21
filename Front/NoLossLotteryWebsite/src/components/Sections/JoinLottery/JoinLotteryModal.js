import React from 'react';
import '../SectionComponents/ModalStyle.css'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import ReactModal from 'react-modal';
import JoinLotteryForm from './JoinLotteryForm';

const JoinLotteryModal = ({ isOpen, onClose, lottery }) => {
  if (!isOpen) return null;

  return (
      <Modal isOpen={isOpen} toggle={onClose} centered style={{transform:'none'}}>
        <a toggle={onClose} style={{fontSize:'1.3em', color:'white'}}> Join Lottery</a>
        <ModalBody >
          <JoinLotteryForm lottery={lottery} />
        </ModalBody>
      </Modal>
  );
};

export default JoinLotteryModal;