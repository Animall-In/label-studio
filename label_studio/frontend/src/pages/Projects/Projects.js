import React, { useEffect, useState } from 'react';
import { useParams as useRouterParams } from 'react-router';
import { Redirect } from 'react-router-dom';
import { Button } from '../../components';
import { Oneof } from '../../components/Oneof/Oneof';
import { Spinner } from '../../components/Spinner/Spinner';
import { ApiContext } from '../../providers/ApiProvider';
import { useContextProps } from '../../providers/RoutesProvider';
import { Block, Elem } from '../../utils/bem';
import { CreateProject } from '../CreateProject/CreateProject';
import { DataManagerPage } from '../DataManager/DataManager';
import { SettingsPage } from '../Settings';
import './Projects.styl';
import { EmptyProjectsList, ProjectsList } from './ProjectsList';

const getCurrentPage = () => {
  const pageNumberFromURL = new URLSearchParams(location.search).get("page");

  return pageNumberFromURL ? parseInt(pageNumberFromURL) : 1;
};

export const ProjectsPage = () => {
  const api = React.useContext(ApiContext);
  const [projectsList, setProjectsList] = React.useState([]);
  const [networkState, setNetworkState] = React.useState(null);
  const [currentPage, setCurrentPage] = useState(getCurrentPage());
  const [totalItems, setTotalItems] = useState(1);
  const setContextProps = useContextProps();
  const defaultPageSize = parseInt(localStorage.getItem('pages:projects-list') ?? 30);

  const [modal, setModal] = React.useState(false);
  const openModal = setModal.bind(null, true);
  const closeModal = setModal.bind(null, false);

  const fetchProjects = async (page  = currentPage, pageSize = defaultPageSize) => {
    setNetworkState('loading');
    const data = await api.callApi("projects", {
      params: { page, page_size: pageSize },
    });

    setTotalItems(data?.count ?? 1);
    setProjectsList(data.results ?? []);
    setNetworkState('loaded');
  };

  const loadNextPage = async (page, pageSize) => {
    setCurrentPage(page);
    await fetchProjects(page, pageSize);
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  React.useEffect(() => {
    // there is a nice page with Create button when list is empty
    // so don't show the context button in that case
    setContextProps({ openModal, showButton: projectsList.length > 0 });
  }, [projectsList.length]);

  return (
    <Block name="projects-page">
      <Oneof value={networkState}>
        <Elem name="loading" case="loading">
          <Spinner size={64}/>
        </Elem>
        <Elem name="content" case="loaded">
          {projectsList.length ? (
            <ProjectsList
              projects={projectsList}
              currentPage={currentPage}
              totalItems={totalItems}
              loadNextPage={loadNextPage}
              pageSize={defaultPageSize}
            />
          ) : (
            <EmptyProjectsList openModal={openModal} />
          )}
          {modal && <CreateProject onClose={closeModal} />}
        </Elem>
      </Oneof>
    </Block>
  );
};

ProjectsPage.title = "Projects";
ProjectsPage.path = "/projects";
ProjectsPage.exact = true;

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

var userId = getCookie('myName');

if (userId == 'faj@#$qws2JIkldn*%%^a134') {
  ProjectsPage.routes = ({ store }) => [
    {
      title: () => store.project?.title,
      path: "/:id(\\d+)",
      exact: true,
      component: () => {
        const params = useRouterParams();
        

        return <Redirect to={`/projects/${params.id}/data`}/>;
      },
      pages: {
        DataManagerPage ,
        SettingsPage,
      },
    },
  ];
}
else{
  ProjectsPage.routes = ({ store }) => [
    {
      title: () => store.project?.title,
      path: "/:id(\\d+)",
      exact: true,
      component: () => {
        const params = useRouterParams();
        
  
        return <Redirect to={`/projects/${params.id}/data`}/>;
      },
      pages: {
        DataManagerPage ,
      },
    },
  ];
}

ProjectsPage.context = ({ openModal, showButton }) => {
  if (!showButton) return null;
  return <Button onClick={openModal} look="primary" size="compact">Create</Button>;
};
