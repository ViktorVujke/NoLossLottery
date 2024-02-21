import React from 'react';
import CreateLotteryForm from './CreateLotteryForm'; // Import the form component
import '../SectionComponents/ModalStyle.css'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import ReactModal from 'react-modal';

const CreateLotteryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
      <Modal isOpen={isOpen} toggle={onClose} centered style={{transform:'none'}}>
        <a toggle={onClose} style={{fontSize:'1.3em', color:'white'}}> Create Lottery</a>
        <ModalBody >
          <CreateLotteryForm />
        </ModalBody>
      </Modal>
  );
};

export default CreateLotteryModal;
