import { takeLatest, put, all, call } from 'redux-saga/effects';
import UserActionTypes  from './user.types';
import { signInSuccess, signInFailure, signOutSuccess, singOutFailure } from './user.actions';
import {
    auth,
    getCurrentUser,
    googleProvider,
    createUserProfileDocument
} from '../../firebase/firebase.utils';

export function* getShapshotFromUserAuth(userAuth) {
    try {
        const userRef = yield call(createUserProfileDocument, userAuth);
        const userSnapshot = yield userRef.get();
        yield put(signInSuccess({ id: userSnapshot.id, ...userSnapshot.data() }));
    } catch (error) {
        yield put(signInFailure(error));
    }
}

export function* signInWithGoogle() {
    try {
        const {user} = yield auth.signInWithPopup(googleProvider);
        yield getShapshotFromUserAuth(user);
    } catch (error) {
        yield put(signInFailure(error));

    }
}

export function* signInWithEmail({ payload: { email, password }}) {
    try {
        const { user } = yield auth.signInWithEmailAndPassword(email, password);
        yield getShapshotFromUserAuth(user);
    } catch (error) {
        yield put(signInFailure(error));
    }
}

export function* isUserAuthenticated() {
    try {
        const userAuth = yield getCurrentUser();
        if (!userAuth) return;
        yield getShapshotFromUserAuth(userAuth);
    } catch (error) {
        yield put(signInFailure(error));
    }
}

export function* signOut() {
    try {
        yield auth.signOut();
        yield put(signOutSuccess());
    } catch (error) {
        yield put(singOutFailure(error));
    }
}

export function* onGoogleSignStart() {
    yield takeLatest(UserActionTypes.GOOGLE_SIGN_IN_START, signInWithGoogle);
}

export function* onEmailSignInStart() {
    yield takeLatest(UserActionTypes.EMAIL_SIGN_IN_START, signInWithEmail);
}

export function* onCheckUserSession() {
    yield takeLatest(UserActionTypes.CHECK_USER_SESSION, isUserAuthenticated);
}

export function* onSingOutStart() {
    yield takeLatest(UserActionTypes.SIGN_OUT_START, signOut);
}

export function* userSagas() {
    yield all([
        call(onGoogleSignStart),
        call(onEmailSignInStart),
        call(onCheckUserSession),
        call(onSingOutStart)
    ]);
}