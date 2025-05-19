import { observer } from 'mobx-react-lite';
import Modal from 'react-modal';
import '../Modal.css';
import AddBoardModalStore from './store_addBoard';
import { useNavigate } from "react-router-dom";
import { checkAuth } from '../../../api/auth';
interface AddBoardModalProps {
  projectId: number;
}
const AddBoardModal = observer(({ projectId }: AddBoardModalProps) => {
  const navigate = useNavigate();
  const handleAddBoard = () => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      console.log(isAuthenticated.data)
      return isAuthenticated.data
    };
    verifyAuth().then((data) => AddBoardModalStore.addBoard(data.id, projectId))
  }
  const closeModal = () => {
    AddBoardModalStore.closeEditor();
  }
  return (
    <Modal
      isOpen={AddBoardModalStore.isOpen}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
      ariaHideApp={false}
      className="modal proj-modal"
    >
      <h2 className='header'>Введите название доски</h2>
      <p className='p'>Название</p>
      <input autoFocus className="input" value={AddBoardModalStore.currentNewName} onChange={e => AddBoardModalStore.changeName(e.target.value)} />
      <div className='button-row'>
        <button onClick={() => handleAddBoard()} type="button" className='add'>Создать</button>
        <button onClick={() => AddBoardModalStore.closeEditor()} type="button" className='close'>Отменить</button>
      </div>
    </Modal>
  )
}
)
export default AddBoardModal;
