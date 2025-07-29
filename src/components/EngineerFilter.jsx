import { View, Picker } from 'react-native';
import ar from '../locales/ar';

export default function EngineerFilter({ governorates, selectedGov, onFilter }) {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedGov}
        onValueChange={onFilter}
        style={styles.picker}
        mode="dropdown"
      >
        <Picker.Item label={ar.COMMON.ALL} value="" />
        {governorates.map((gov) => (
          <Picker.Item key={gov} label={gov} value={gov} />
        ))}
      </Picker>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    fontFamily: 'Tajawal-Regular',
    textAlign: 'right',
  },
};