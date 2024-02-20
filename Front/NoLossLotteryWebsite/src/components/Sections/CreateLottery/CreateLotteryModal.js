import React from 'react';
import CreateLotteryForm from './CreateLotteryForm'; // Import the form component
import '../SectionComponents/ModalStyle.css'

const CreateLotteryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>X</button>
        <CreateLotteryForm />
      </div>
    </div>
  );
};

export default CreateLotteryModal;
