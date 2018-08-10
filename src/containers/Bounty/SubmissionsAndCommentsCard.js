import React from 'react';
import styles from './SubmissionsAndCommentsCard.module.scss';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { map as fpMap } from 'lodash';
import { PageCard, FormSection } from 'explorer-components';
import { Field, reduxForm } from 'redux-form';
import { SubmissionItem, NewCommentForm, CommentItem } from './components';
import { Button, ListGroup, Loader, Tabs, Text, ZeroState } from 'components';
import { rootBountyPageSelector } from './selectors';
import { fulfillmentsSelector } from 'public-modules/Fulfillments/selectors';
import { commentsSelector } from 'public-modules/Comments/selectors';
import { actions as fulfillmentsActions } from 'public-modules/Fulfillments';
import { actions as fulfillmentActions } from 'public-modules/Fulfillment';
import { actions as commentsActions } from 'public-modules/Comments';
import { actions as bountyUIActions } from './reducer';

const map = fpMap.convert({ cap: false });

let SubmissionsAndCommentsCardComponent = props => {
  const {
    setActiveTab,
    currentTab,
    fulfillments,
    comments,
    bounty,
    currentUser,
    acceptFulfillment,
    postComment
  } = props;

  const bountyBelongsToLoggedInUser =
    currentUser && bounty.issuer === currentUser.public_address;

  const renderFulfillments = () => {
    return map(fulfillment => {
      const {
        fulfillment_id,
        fulfiller_email,
        fulfiller,
        sourceDirectoryHash,
        sourceFileName,
        accepted,
        created,
        description,
        user
      } = fulfillment;

      const { name, profile_image } = user;
      const submissionBelongsToLoggedInUser =
        currentUser && fulfiller === currentUser.public_address;

      return (
        <ListGroup.ListItem hover>
          <SubmissionItem
            name={name}
            email={fulfiller_email}
            address={fulfiller}
            img={profile_image}
            url={'add link to model in api'}
            description={description}
            dataHash={sourceDirectoryHash}
            dataFileName={sourceFileName}
            created={created}
            accepted={accepted}
            showAccept={bountyBelongsToLoggedInUser}
            showEdit={submissionBelongsToLoggedInUser}
            acceptFulfillment={() =>
              acceptFulfillment(bounty.id, fulfillment_id)
            }
          />
        </ListGroup.ListItem>
      );
    }, fulfillments.list);
  };

  const renderComments = () => {
    return map(comment => {
      const { text, user, created } = comment;
      const { name, profile_image, public_address } = user;

      return (
        <ListGroup.ListItem className={styles.commentItem} hover>
          <CommentItem
            name={name}
            address={public_address}
            img={profile_image}
            text={text}
            created={created}
          />
        </ListGroup.ListItem>
      );
    }, comments.list);
  };

  let body = <div />;
  let bodyClass = '';

  if (currentTab == 'submissions') {
    body = <ListGroup>{renderFulfillments()}</ListGroup>;

    if (!fulfillments.list.length) {
      bodyClass = styles.bodyLoading;
      body = (
        <div className={styles.zeroState}>
          <ZeroState
            title={'There are 0 submissions'}
            text={'Submissions to this bounty will appear here.'}
            iconColor="blue"
          />
        </div>
      );
    }

    if (fulfillments.loading) {
      bodyClass = styles.bodyLoading;
      body = <Loader color="blue" size="medium" />;
    }
  }

  if (currentTab == 'comments') {
    const newCommentForm = currentUser ? (
      <ListGroup.ListItem className={styles.commentItem}>
        <NewCommentForm
          onSubmit={values => postComment(bounty.id, values.text)}
          loading={comments.posting}
        />
      </ListGroup.ListItem>
    ) : null;

    body = (
      <ListGroup>
        {newCommentForm}
        {renderComments()}
      </ListGroup>
    );

    if (!comments.list.length) {
      body = (
        <ListGroup>
          {newCommentForm}
          <ListGroup.ListItem className={styles.commentItem}>
            <ZeroState
              title={'There are 0 comments'}
              text={'Submit a comment using the form above.'}
              iconColor="blue"
            />
          </ListGroup.ListItem>
        </ListGroup>
      );
    }

    if (comments.loading) {
      bodyClass = styles.bodyLoading;
      body = <Loader color="blue" size="medium" />;
    }
  }

  return (
    <div>
      <div className={styles.tabsContainer}>
        <Tabs
          className={styles.tabs}
          currentKey={currentTab}
          defaultActiveKey={currentTab}
          onSelect={setActiveTab}
        >
          <Tabs.Tab
            tabClassName={styles.tab}
            tabColor="lightGrey"
            tabCount={fulfillments.list.length}
            eventKey={'submissions'}
          >
            <Text typeScale="h3">Submissions</Text>
          </Tabs.Tab>
          <Tabs.Tab
            tabClassName={styles.tab}
            tabColor="lightGrey"
            tabCount={
              comments.list.length ? comments.list.length : bounty.comment_count
            }
            eventKey={'comments'}
          >
            <Text typeScale="h3">Comments</Text>
          </Tabs.Tab>
        </Tabs>
      </div>
      <div className={bodyClass}>{body}</div>
    </div>
  );
};

const mapStateToProps = (state, router) => {
  const bountyPage = rootBountyPageSelector(state);
  const fulfillmentsState = fulfillmentsSelector(state);
  const commentsState = commentsSelector(state);

  return {
    // ui state
    modalType: bountyPage.modalType,
    modalVisible: bountyPage.modalVisible,
    currentTab: bountyPage.currentTab,

    // data
    fulfillments: {
      ...fulfillmentsState,
      list: fulfillmentsState.fulfillments
    },
    comments: {
      ...commentsState,
      list: commentsState.comments
    }
  };
};

const SubmissionsAndCommentsCard = compose(
  connect(
    mapStateToProps,
    {
      setActiveTab: bountyUIActions.setActiveTab,
      acceptFulfillment: fulfillmentActions.acceptFulfillment,
      postComment: commentsActions.postComment
    }
  )
)(SubmissionsAndCommentsCardComponent);

export default SubmissionsAndCommentsCard;