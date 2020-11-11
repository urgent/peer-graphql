import { merge } from './merge'
test('merge works ', async (done) => {
    const res = merge(`${__dirname}/../../schema.project.graphql`);
    done();
})