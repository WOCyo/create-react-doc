import React, { PureComponent } from 'react';
import { Switch, Link, Route, Redirect } from 'react-router-dom';
import cx from 'classnames';
import Menu from '../component/Menu';
import Icon from '../component/Icon';
import Affix from '../component/Affix';
import Header from '../component/Header';
import Footer from '../component/Footer';
import logo from '../crd.logo.svg';
import styles from './BasicLayout.less';

const SubMenu = Menu.SubMenu;

export default class BasicLayout extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inlineCollapsed: false,
    };
  }
  componentDidUpdate() {
    this.scrollToTop();
  }
  componentDidMount() {
    this.scrollToTop();
  }
  scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  renderSubMenuItem(menus) {
    const { location: { pathname } } = this.props;
    if (menus.length > 1) {
      menus = menus.sort((a, b) => {
        if (a.sort < b.sort) return -1;
        if (a.sort > b.sort) return 1;
        return 0;
      });
    }
    /* eslint-disable */
    return (
      <>
        {menus.map((item, index) => {
          if (item.mdconf && item.mdconf.visible === false) return null;
          if (/^README(.*)md$/.test(item.name)) return null;
          return item.children && item.children.length > 0 ? (
            <SubMenu title={item.name} icon={<Icon type="folder" size={16} />}>
              {this.renderSubMenuItem(item.children)}
            </SubMenu>
          ) : (
            <Menu.Item
              icon={<Icon type="file" size={16} />}
              title={
                <span
                  className={cx({
                    active: pathname === item.routePath,
                  })}
                >
                  {item &&
                  item.type === "directory" &&
                  item.props &&
                  item.props.isEmpty ? (
                    <span>{(item.mdconf && item.mdconf.title) || item.name}</span>
                  ) : (
                    <Link
                      to={item.routePath}
                      replace={pathname === item.routePath}
                    >
                      {item && item.mdconf && item.mdconf.title
                        ? item.mdconf.title
                        : item.title}
                    </Link>
                  )}
                </span>
              }
            />
          );
        })}
      </>
    );
  }
  renderMenu(menus) {
    const { location: { pathname }, routeData } = this.props;
    // const article = getCurrentArticle(routeData, pathname);
    // menus = menus.filter(item => item.article === article);
    if (menus.length < 1) return null;
    return (
      <Affix
        offsetTop={0}
        affixStyle={{
          overflow: "auto",
          height: "100vh",
          borderRight: "1px solid rgb(233, 233, 233)",
        }}
        width={this.state.inlineCollapsed ? 0 : 240}
      >
        <Menu
          mode="inline"
          inlineCollapsed={this.state.inlineCollapsed}
          affixStyle={ this.state.inlineCollapsed ? { width: 0 } : { width: 240 }}
          // openKeys={this.state.openKeys}
          // onOpenChange={this.onOpenChange}
        >
          {this.renderSubMenuItem(menus || [])}
        </Menu>
      </Affix>
    );
  }
  isCurentChildren() {
    const { location: { pathname }, menuSource, routeData } = this.props;
    const getRoute = routeData.filter(item => pathname === item.path);
    const article = getRoute.length > 0 ? getRoute[0].article : null;
    const childs = menuSource.filter(item => article === item.article && item.children && item.children.length > 1);
    return childs.length > 0;
  }
  toggleMenu = () => {
    const { inlineCollapsed } = this.state;
    this.setState({
      inlineCollapsed: !inlineCollapsed,
    });
  }
  render() {
    const { inlineCollapsed } = this.state
    const { menuSource, routeData, indexProps } = this.props;
    const isChild = this.isCurentChildren();
    return (
      <div className={styles.wrapper}>
        <Header
          logo={logo}
          href="/"
          location={this.props.location}
          indexProps={indexProps}
          menuSource={menuSource}
        />
        <div className={styles.wrapperContent}>
          {isChild && (
            <div
              className={cx(styles.menuwrapper, {
                [`${styles["menuwrapper-inlineCollapsed"]}`]: inlineCollapsed,
              })}
            >
              <div
                className={cx(styles.toggle, {
                  [`${styles["toggle-collapsed"]}`]: inlineCollapsed,
                })}
                onClick={this.toggleMenu}
              />
              {this.renderMenu(menuSource)}
            </div>
          )}
          <div
            className={cx({
              [`${styles.content}`]: isChild,
              [`${styles.contentNoMenu}`]: !isChild,
              [`${styles["content-inlineCollapsed"]}`]: inlineCollapsed,
            })}
          >
            <Switch>
              {routeData.map((item) => {
                // 重定向跳转
                if (item && item.mdconf && item.mdconf.redirect) {
                  let redirectPath = `${item.path || ""}/${
                    item.mdconf.redirect
                  }`;
                  redirectPath = redirectPath.replace(/^\/\//, "/");
                  return (
                    <Route
                      key={item.path}
                      exact
                      path={item.path}
                      render={() => <Redirect to={redirectPath} />}
                    />
                  );
                }
                return (
                  <Route
                    key={item.path}
                    exact
                    path={item.path}
                    render={() => {
                      const Comp = item.component;
                      return <Comp {...item} />;
                    }}
                  />
                );
              })}
              <Redirect to="/404" />
            </Switch>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
