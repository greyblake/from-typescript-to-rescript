
type RemoteDataInner<T, E> =
    { type: 'NOT_ASKED' }
    | { type: 'LOADING' }
    | { type: 'FAILURE', error: E }
    | { type: 'SUCCESS', data: T }

interface MatchHandlers<T, E, R> {
    notAsked: () => R,
    loading: () => R,
    success: (data: T) => R,
    failure: (error: E) => R,
}

class RemoteData<T, E> {
    inner: RemoteDataInner<T, E> = { type: 'NOT_ASKED' };

    constructor(inner: RemoteDataInner<T, E>) {
        this.inner = inner;
    }

    public static newNotAsked<T, E>(): RemoteData<T, E> {
        const inner: RemoteDataInner<T, E> = { type: 'NOT_ASKED' };
        return new RemoteData<T, E>(inner);
    }

    static newLoading<T, E>(): RemoteData<T, E> {
        const inner: RemoteDataInner<T, E> = { type: 'LOADING' };
        return new RemoteData<T, E>(inner);
    }

    static newFailure<T, E>(error: E): RemoteData<T, E> {
        const inner: RemoteDataInner<T, E> = { type: 'FAILURE', error };
        return new RemoteData<T, E>(inner);
    }

    static newSuccess<T, E>(data: T): RemoteData<T, E> {
        const inner: RemoteDataInner<T, E> = { type: 'SUCCESS', data };
        return new RemoteData<T, E>(inner);
    }

    match<R>(handlers: MatchHandlers<T, E, R>): R {
        switch (this.inner.type) {
            case 'NOT_ASKED': {
                return handlers.notAsked();
            }
            case 'LOADING': {
                return handlers.loading();
            }
            case 'FAILURE': {
                return handlers.failure(this.inner.error);
            }
            case 'SUCCESS': {
                return handlers.success(this.inner.data);
            }
            default:
                throw new Error("match() is supposed to be exhaustive");
        }
    }

    mapSuccess<T2>(transform: (val: T) => T2): RemoteData<T2, E> {
        switch (this.inner.type) {
            case 'SUCCESS': {
                const newData: T2 = transform(this.inner.data);
                return RemoteData.newSuccess(newData);
            }
            case 'NOT_ASKED': {
                return RemoteData.newNotAsked();
            }
            case 'LOADING': {
                return RemoteData.newLoading();
            }
            case 'FAILURE': {
                return RemoteData.newFailure(this.inner.error);
            }
            default:
                throw new Error("match() is supposed to be exhaustive");
        }
    }

    isLoading(): boolean {
        return this.match({
            notAsked: () => false,
            loading: () => true,
            success: (_) => false,
            failure: (_) => false,
        });
    }
}

export { RemoteData };
