import { observer } from 'mobx-react-lite';
import Modal from 'react-modal';
import '../Modal.css';
import AddProjectModalStore from './store_addProject';
import { useNavigate } from "react-router-dom";
import { checkAuth } from '../../../api/auth';

const AddProjectModal = observer(() => {
  const navigate = useNavigate();
  const handleAddProject = () => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      console.log(isAuthenticated.data)
      return isAuthenticated.data
    };
    verifyAuth().then((data) => AddProjectModalStore.addProject(data.id))
  }
  const closeModal = () => {
    AddProjectModalStore.closeEditor();
  }
  return (
    <Modal
      isOpen={AddProjectModalStore.isOpen}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
      ariaHideApp={false}
      className="modal proj-modal"
    >
      <h2 className='header'>Введите название и описание проекта</h2>
      <p className='p'>Название</p>
      <input autoFocus className="input" value={AddProjectModalStore.currentNewName} onChange={e => AddProjectModalStore.changeName(e.target.value)} />
      <p className='p'>Описание</p>
      <textarea className="textArea" value={AddProjectModalStore.currentDescription} onChange={e => AddProjectModalStore.changeDescription(e.target.value)} />
      <div className='button-row'>
        <button onClick={() => handleAddProject()} type="button" className='add'>Создать</button>
        <button onClick={() => AddProjectModalStore.closeEditor()} type="button" className='close'>Отменить</button>
      </div>
    </Modal>
  )
}
)
export default AddProjectModal;
