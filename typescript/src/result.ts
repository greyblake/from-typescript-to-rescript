
type ResultInner<T, E> =
    | { type: 'OK', value: T }
    | { type: 'ERROR', error: E };

interface MatchHandlers<T, E, R> {
    ok: (value: T) => R,
    err: (error: E) => R,
}

class Result<T, E> {
    inner: ResultInner<T, E>;

    constructor(inner: ResultInner<T, E>) {
        this.inner = inner;
    }

    public static newOk<T, E>(value: T): Result<T, E> {
        const inner: ResultInner<T, E> = { type: 'OK', value, };
        return new Result<T, E>(inner);
    }

    public static newErr<T, E>(error: E): Result<T, E> {
        const inner: ResultInner<T, E> = { type: 'ERROR', error, };
        return new Result<T, E>(inner);
    }

    match<R>(handlers: MatchHandlers<T, E, R>): R {
        switch (this.inner.type) {
            case 'OK': {
                return handlers.ok(this.inner.value);
            }
            case 'ERROR': {
                return handlers.err(this.inner.error);
            }
            default:
                throw new Error("Result.match() is supposed to be exhaustive");
        }
    }

    mapOk<T2>(transform: (val: T) => T2): Result<T2, E> {
        return this.match({
            ok: (val) => Result.newOk(transform(val)),
            err: (e) => Result.newErr(e),
        });
    }

    isOk(): boolean {
        return this.match({
            ok: (_) => true,
            err: (_) => false,
        });
    }

    isErr(): boolean {
        return !this.isOk();
    }

    err(): E | null {
        return this.match({
            ok: (_) => null,
            err: (e) => e,
        });
    }

    ok(): T | null {
        return this.match({
            ok: (val) => val,
            err: (_) => null,
        });
    }

    unwrap(): T {
        return this.match({
            ok: (val) => val,
            err: (e) => {
                throw new Error(`Cannot unwrap Result with an error: ${e}`);
            },
        });
    }
}

export { Result };
