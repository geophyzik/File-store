import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/ru';
import Preview from './components/preview';
import getDescription from './components/getDescription';
import { State, FileOrFolder, DomElements, File, Folder, Rename } from './types';

export default (): void => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();
  i18n
  .init({
    lng: defaultLanguage,
    debug: false,
    resources: { ru },
  })
  .then(() => {
    const state: State = {
      data: [
        {
          name: 'Folder 1',
          type: 'folder',
          children: [
            {
              name: 'File 1',
              type: 'file',
              description: '',
              content:
                'using System; if (1 === 1) {console.log(`hi`)};This is /// <summary> /// desc of file /// </summary> the content of File This is the content of File 1 This is the content of File 1',
            },
            {
              name: 'File 3',
              type: 'file',
              description: '',
              content:
                'import Main; if /// <summary> /// sdfdsf /// </summary> the content of File This is the content of File 1 This is the content of File 1',
            },
          ],
        },
      ],
      openFileData: [],
      UIstate: {
        currentNodeType: null,
        currentFolderDom: null,
        currentFolderData: null,
        currentFileDom: null,
        currentFileData: null,
      },
    };

    const elements: DomElements = {
      fileExplorer: document.getElementById('root'),
      openListTab: document.querySelector('.viewList'),
      openContentTab: document.querySelector('.viewTab'),
      createFolderBtn: document.getElementById('create-folder-btn'),
      removeFolderBtn: document.getElementById('remove-folder-btn'),
      uploadFileBtn: document.getElementById('upload-file-btn'),
      downloadFileBtn: document.getElementById('download-file-btn'),
      removeFileBtn: document.getElementById('remove-file-btn'),
      renameBtn: document.getElementById('rename-btn'),
      editFileDescBtn: document.getElementById('edit-description-btn'),
    };

    const updateSchema = (stateStore: State) =>
      yup.object().shape({
        name: yup
          .string()
          .required()
          .trim()
          .notOneOf(
            stateStore.data.map((el: FileOrFolder) => el.name.trim()),
            i18n.t('errors.duplicate'),
          ),
      });

    const createFileView = (data: File[]) => {
      data.forEach((item: File) => {
        const listTab = document.createElement('li');
        const nameTab = document.createElement('span');
        const closeBtn = document.createElement('span');
        const editor = document.createElement('div');
        const currentOpenTab = document.querySelector('.activeTab');
  
        editor.classList.add('content');
        currentOpenTab?.classList.remove('activeTab');
        closeBtn.classList.add('closeBtnTab');
        listTab.classList.add('activeTab');
        nameTab.classList.add('nameTab');
        closeBtn.innerHTML = `&times;`;
        nameTab.textContent = item.name;
        if (elements.openContentTab) {
          elements.openContentTab.textContent = '';
        }
  
        listTab.appendChild(nameTab);
        listTab.appendChild(closeBtn);
        elements.openListTab?.appendChild(listTab);
        elements.openContentTab?.appendChild(editor);
        
        nameTab.addEventListener('click', () => {
          const lastOpenTab = document.querySelector('.activeTab');
          lastOpenTab?.classList.remove('activeTab');

          listTab.classList.add('activeTab');

          if (elements.openContentTab) {
            elements.openContentTab.textContent = '';
          }
          elements.openContentTab?.appendChild(editor);
          Preview(item.content);
        });
  
        closeBtn.addEventListener('click', () => {
          const index = state.openFileData.indexOf(item);
          if (index !== -1) {
            state.openFileData.splice(index, 1);
          }
          if(elements.openListTab) {
            elements.openListTab.textContent = '';
            editor.innerHTML = '';
            createFileView(state.openFileData);
            const lengthOpenTabs = state.openFileData.length;
            if (lengthOpenTabs !== 0) {
              Preview(state.openFileData[lengthOpenTabs - 1].content);
            } else {
              elements.openContentTab?.replaceChildren('');
            }
          }
        });
      });
    };
  
    const createFileExplorer = (data: FileOrFolder[], parent: HTMLElement | null) => {
      const ul = document.createElement('ul');
      parent?.appendChild(ul);

      data.forEach((item) => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        
        name.textContent = item.name;

        ul.appendChild(li);
        li.appendChild(name);

        if (name.parentNode && name.parentNode.nodeName === 'LI') {
          name.addEventListener('click', () => {
            state.UIstate.currentNodeType = item.type;
            if (name.parentNode instanceof Element) {
              name.parentNode.classList.toggle('open');
            }
            if ('children' in item) {
              state.UIstate.currentFolderData = item;
              state.UIstate.currentFolderDom = name.parentNode as HTMLElement;
            }
            if ('description' in item) {
              if (state.openFileData.filter((el) => el.name === item.name).length > 0) {
                alert(i18n.t('errors.duplicateOpen'))        // error
              } else {
                state.openFileData.push(item);
                state.UIstate.currentFileData = item;
                state.UIstate.currentFileDom = name.parentNode as HTMLElement;
                createFileView([item]);
                Preview(item.content);
              }
            }
          });
        }
  
        if ('description' in item) {
          li.classList.add('file-root');
          const tooltip = document.getElementById('popover') as HTMLElement;
          if (tooltip) {
            tooltip.classList.add('tooltip');
            tooltip.popover = 'manual';
            tooltip.style.position = 'absolute';
            tooltip.style.margin = '0';
          }
          const fileDescription = getDescription(item.content);
          if (item.description.length === 0) {
            item.description = fileDescription.split('///').join(' ');
          }
  
          name.addEventListener('mouseover', (e) => {
            tooltip.textContent = item.description;
            const x = e.clientX;
            const y = e.clientY;
  
            tooltip.style.left = `${x + 10}px`;
            tooltip.style.top = `${y + 10}px`;
            tooltip.style.display = 'block';
          });
  
          name.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
          });
        }
  
        if ('children' in item) {
          li.classList.add('folder-root');
          li.classList.add('closed');
          createFileExplorer(item.children, li);
        }
      });
    };
  
    elements.createFolderBtn?.addEventListener('click', () => {
      const name = prompt('Enter folder name')?.trim();
      const schema = updateSchema(state);
      schema
        .validate({ name })
        .then((response: Rename) => {
          const currentNode = state.UIstate.currentFolderDom;
          let parentLi = elements.fileExplorer;
          if (currentNode) {
            parentLi = currentNode.classList.contains('open')
              ? currentNode
              : elements.fileExplorer;
          }
          const newNode: Folder = {
            name: response.name,
            type: 'folder',
            children: [],
          };
          createFileExplorer([newNode], parentLi);
        })
        .catch((err: string) => {
          throw new Error(err);
        });
    });
  
    elements.removeFolderBtn?.addEventListener('click', () => {
      const currentNode = state.UIstate.currentFolderDom;
      if (currentNode) {
        const parentLi = currentNode;
        state.UIstate.currentFolderData = null;
        state.UIstate.currentFolderDom = null;
        parentLi.remove();
      } else {
        alert(i18n.t('errors.chooseFolder'));
      }
    });
  
    elements.renameBtn?.addEventListener('click', () => {
      const currentNodeFolder = state.UIstate.currentFolderDom;
      const currentNodeFile = state.UIstate.currentFileDom;
      const currentType = state.UIstate.currentNodeType;
      if (currentNodeFolder || currentNodeFile) {
        const name = prompt('Enter folder name')?.trim();
        const schema = updateSchema(state);
        schema
          .validate({ name })
          .then((response: Rename) => {
            if (currentType === 'folder') {
              const currentNode = state.UIstate.currentFolderDom;
              if (currentNode) {
                currentNode.childNodes[0].textContent = response.name;
              } else {
                alert(i18n.t('errors.chooseFolder'));
              }
            }
            if (currentType === 'file') {
              const currentNode = state.UIstate.currentFileDom;
              if (currentNode) {
                currentNode.childNodes[0].textContent = response.name;
              } else {
                alert(i18n.t('errors.chooseFile'));
              }
            }
          })
          .catch((err: string) => {
            throw new Error(err);
          });
      } else {
        alert(i18n.t('errors.chooseFolderOrFile'));
      }
    });
  
    elements.uploadFileBtn?.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
  
      fileInput.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const selectedFile = target.files?.[0];
  
        if (selectedFile) {
          const reader = new FileReader();
  
          reader.onload = (e) => {
            const fileContent = e.target?.result as string;
            const currentNode = state.UIstate.currentFolderDom;
            let parentLi = elements.fileExplorer;
            if (currentNode) {
              parentLi = currentNode.classList.contains('open')
                ? currentNode
                : elements.fileExplorer;
            }
            const newFile = {
              name: selectedFile.name,
              type: 'file',
              description: '',
              content: fileContent,
            };
            createFileExplorer([newFile], parentLi);
          };
  
          reader.readAsText(selectedFile);
        }
      });
  
      fileInput.click();
    });
  
    elements.downloadFileBtn?.addEventListener('click', () => {
      const filedata = state.UIstate.currentFileData;
      if (filedata) {
        const blob = new Blob([filedata.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
  
        const a = document.createElement('a');
        a.href = url;
        a.download = filedata.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(i18n.t('errors.chooseFile'));
      }
    });

    elements.removeFileBtn?.addEventListener('click', () => {
      const currentNode = state.UIstate.currentFileDom;
      if (currentNode) {
        const parentLi = currentNode;
        state.UIstate.currentFileData = null;
        state.UIstate.currentFileDom = null;
        parentLi.remove();
      } else {
        alert(i18n.t('errors.chooseFile'));
      }
    });
  
    elements.editFileDescBtn?.addEventListener('click', () => {
      const currentFile = state.UIstate.currentFileData;
      if (currentFile) {
        const newDescription = prompt('Enter desc')?.trim();
        if (newDescription) {
          currentFile.description = newDescription;
        }
      } else {
        alert(i18n.t('errors.chooseFile'))
      }
    });

    createFileExplorer(state.data, elements.fileExplorer);
    createFileView(state.openFileData);

  });
};